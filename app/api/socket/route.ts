import type { NextRequest } from "next/server"
import { Server } from "socket.io"
import { verifyJWT } from "@/lib/jwt"
import { executeQuery } from "@/lib/database"

const SocketHandler = (req: NextRequest, res: any) => {
  if (res.socket.server.io) {
    console.log("Socket is already running")
  } else {
    console.log("Socket is initializing")
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    const connectedUsers = new Map()

    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        const payload = verifyJWT(token)

        if (!payload) {
          return next(new Error("Authentication error"))
        }

        socket.userId = payload.userId
        socket.username = payload.username
        next()
      } catch (err) {
        next(new Error("Authentication error"))
      }
    })

    io.on("connection", async (socket) => {
      console.log(`User ${socket.username} connected`)

      // Store user connection
      connectedUsers.set(socket.userId, socket.id)

      // Update user online status
      await executeQuery("UPDATE users SET is_online = TRUE, last_seen = NOW() WHERE id = ?", [socket.userId])

      // Join user to their conversation rooms
      const conversations = (await executeQuery(
        "SELECT conversation_id FROM conversation_participants WHERE user_id = ?",
        [socket.userId],
      )) as any[]

      conversations.forEach((conv: any) => {
        socket.join(`conversation_${conv.conversation_id}`)
      })

      // Handle new message
      socket.on("send_message", async (data) => {
        try {
          const { conversationId, content, messageType, fileUrl, replyToMessageId } = data

          // Verify user is participant
          const participants = (await executeQuery(
            "SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?",
            [conversationId, socket.userId],
          )) as any[]

          if (participants.length === 0) {
            socket.emit("error", { message: "Access denied" })
            return
          }

          // Insert message
          const result = (await executeQuery(
            "INSERT INTO messages (conversation_id, sender_id, content, message_type, file_url, reply_to_message_id) VALUES (?, ?, ?, ?, ?, ?)",
            [conversationId, socket.userId, content, messageType || "text", fileUrl, replyToMessageId],
          )) as any

          // Get complete message data
          const messages = (await executeQuery(
            `SELECT m.id, m.content, m.message_type, m.file_url, m.created_at,
                    u.id as sender_id, u.username as sender_username, u.full_name as sender_name, u.profile_picture as sender_picture
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.id = ?`,
            [result.insertId],
          )) as any[]

          const message = messages[0]

          // Broadcast to conversation room
          io.to(`conversation_${conversationId}`).emit("new_message", {
            conversationId,
            message,
          })

          // Update message status to delivered for online users
          const conversationParticipants = (await executeQuery(
            "SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?",
            [conversationId, socket.userId],
          )) as any[]

          for (const participant of conversationParticipants) {
            if (connectedUsers.has(participant.user_id)) {
              await executeQuery(
                "INSERT INTO message_status (message_id, user_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?",
                [result.insertId, participant.user_id, "delivered", "delivered"],
              )
            }
          }
        } catch (error) {
          console.error("Send message error:", error)
          socket.emit("error", { message: "Failed to send message" })
        }
      })

      // Handle message read
      socket.on("mark_read", async (data) => {
        try {
          const { messageId, conversationId } = data

          await executeQuery(
            "INSERT INTO message_status (message_id, user_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?",
            [messageId, socket.userId, "read", "read"],
          )

          // Notify sender
          io.to(`conversation_${conversationId}`).emit("message_read", {
            messageId,
            userId: socket.userId,
          })
        } catch (error) {
          console.error("Mark read error:", error)
        }
      })

      // Handle typing indicators
      socket.on("typing_start", (data) => {
        socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
          userId: socket.userId,
          username: socket.username,
          conversationId: data.conversationId,
        })
      })

      socket.on("typing_stop", (data) => {
        socket.to(`conversation_${data.conversationId}`).emit("user_stop_typing", {
          userId: socket.userId,
          conversationId: data.conversationId,
        })
      })

      // Handle disconnect
      socket.on("disconnect", async () => {
        console.log(`User ${socket.username} disconnected`)

        // Remove from connected users
        connectedUsers.delete(socket.userId)

        // Update user offline status
        await executeQuery("UPDATE users SET is_online = FALSE, last_seen = NOW() WHERE id = ?", [socket.userId])

        // Broadcast user offline status
        socket.broadcast.emit("user_offline", {
          userId: socket.userId,
        })
      })
    })
  }
  res.end()
}

export { SocketHandler as GET, SocketHandler as POST }

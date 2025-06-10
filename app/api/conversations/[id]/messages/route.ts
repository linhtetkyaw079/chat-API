import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { withAuth } from "@/lib/auth-middleware"

async function getMessagesHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = (req as any).user
    const conversationId = params.id
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    // Check if user is participant
    const participants = (await executeQuery(
      "SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?",
      [conversationId, user.userId],
    )) as any[]

    if (participants.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get messages
    const messages = (await executeQuery(
      `SELECT m.id, m.content, m.message_type, m.file_url, m.created_at,
              u.id as sender_id, u.username as sender_username, u.full_name as sender_name, u.profile_picture as sender_picture,
              rm.content as reply_content, ru.username as reply_sender_username
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       LEFT JOIN messages rm ON m.reply_to_message_id = rm.id
       LEFT JOIN users ru ON rm.sender_id = ru.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [conversationId, limit, offset],
    )) as any[]

    return NextResponse.json({ messages: messages.reverse() })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendMessageHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = (req as any).user
    const conversationId = params.id
    const { content, messageType, fileUrl, replyToMessageId } = await req.json()

    // Check if user is participant
    const participants = (await executeQuery(
      "SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?",
      [conversationId, user.userId],
    )) as any[]

    if (participants.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Insert message
    const result = (await executeQuery(
      "INSERT INTO messages (conversation_id, sender_id, content, message_type, file_url, reply_to_message_id) VALUES (?, ?, ?, ?, ?, ?)",
      [conversationId, user.userId, content, messageType || "text", fileUrl, replyToMessageId],
    )) as any

    const messageId = result.insertId

    // Get all participants for message status
    const allParticipants = (await executeQuery(
      "SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?",
      [conversationId, user.userId],
    )) as any[]

    // Create message status for all participants
    for (const participant of allParticipants) {
      await executeQuery("INSERT INTO message_status (message_id, user_id, status) VALUES (?, ?, ?)", [
        messageId,
        participant.user_id,
        "sent",
      ])
    }

    // Get the complete message data
    const messages = (await executeQuery(
      `SELECT m.id, m.content, m.message_type, m.file_url, m.created_at,
              u.id as sender_id, u.username as sender_username, u.full_name as sender_name, u.profile_picture as sender_picture
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [messageId],
    )) as any[]

    return NextResponse.json({ message: messages[0] })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getMessagesHandler)
export const POST = withAuth(sendMessageHandler)

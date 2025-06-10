import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { withAuth } from "@/lib/auth-middleware"

async function getConversationsHandler(req: NextRequest) {
  try {
    const user = (req as any).user

    const conversations = (await executeQuery(
      `SELECT DISTINCT c.id, c.type, c.name, c.description, c.group_picture, c.created_at,
              u.full_name as other_user_name, u.username as other_username, u.profile_picture as other_profile_picture,
              u.is_online as other_is_online,
              (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
       FROM conversations c
       JOIN conversation_participants cp ON c.id = cp.conversation_id
       LEFT JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != ?
       LEFT JOIN users u ON cp2.user_id = u.id
       WHERE cp.user_id = ?
       ORDER BY last_message_time DESC`,
      [user.userId, user.userId],
    )) as any[]

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function createConversationHandler(req: NextRequest) {
  try {
    const { type, participantIds, name, description } = await req.json()
    const user = (req as any).user

    if (!type || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json({ error: "Invalid conversation data" }, { status: 400 })
    }

    // For private chats, check if conversation already exists
    if (type === "private" && participantIds.length === 1) {
      const existingConversation = (await executeQuery(
        `SELECT c.id FROM conversations c
         JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
         JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
         WHERE c.type = 'private' AND cp1.user_id = ? AND cp2.user_id = ?`,
        [user.userId, participantIds[0]],
      )) as any[]

      if (existingConversation.length > 0) {
        return NextResponse.json({ conversationId: existingConversation[0].id })
      }
    }

    // Create conversation
    const result = (await executeQuery(
      "INSERT INTO conversations (type, name, description, created_by) VALUES (?, ?, ?, ?)",
      [type, name, description, user.userId],
    )) as any

    const conversationId = result.insertId

    // Add creator as participant
    await executeQuery("INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES (?, ?, ?)", [
      conversationId,
      user.userId,
      type === "group" ? "admin" : "member",
    ])

    // Add other participants
    for (const participantId of participantIds) {
      await executeQuery("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)", [
        conversationId,
        participantId,
      ])
    }

    return NextResponse.json({ conversationId })
  } catch (error) {
    console.error("Create conversation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getConversationsHandler)
export const POST = withAuth(createConversationHandler)

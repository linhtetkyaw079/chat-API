import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { withAuth } from "@/lib/auth-middleware"

async function getStoriesHandler(req: NextRequest) {
  try {
    const user = (req as any).user

    const stories = (await executeQuery(
      `SELECT s.id, s.content, s.story_type, s.file_url, s.background_color, s.created_at, s.expires_at,
              u.id as user_id, u.username, u.full_name, u.profile_picture,
              (SELECT COUNT(*) FROM story_views WHERE story_id = s.id) as view_count,
              (SELECT COUNT(*) FROM story_views WHERE story_id = s.id AND viewer_id = ?) as viewed_by_me
       FROM stories s
       JOIN users u ON s.user_id = u.id
       WHERE s.expires_at > NOW()
       ORDER BY s.created_at DESC`,
      [user.userId],
    )) as any[]

    return NextResponse.json({ stories })
  } catch (error) {
    console.error("Get stories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function createStoryHandler(req: NextRequest) {
  try {
    const user = (req as any).user
    const { content, storyType, fileUrl, backgroundColor } = await req.json()

    if (!storyType) {
      return NextResponse.json({ error: "Story type is required" }, { status: 400 })
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const result = (await executeQuery(
      "INSERT INTO stories (user_id, content, story_type, file_url, background_color, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
      [user.userId, content, storyType, fileUrl, backgroundColor, expiresAt],
    )) as any

    return NextResponse.json({ storyId: result.insertId })
  } catch (error) {
    console.error("Create story error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getStoriesHandler)
export const POST = withAuth(createStoryHandler)

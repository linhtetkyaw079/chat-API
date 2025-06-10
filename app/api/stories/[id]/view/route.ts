import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { withAuth } from "@/lib/auth-middleware"

async function viewStoryHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = (req as any).user
    const storyId = params.id

    // Check if story exists and is not expired
    const stories = (await executeQuery("SELECT id FROM stories WHERE id = ? AND expires_at > NOW()", [
      storyId,
    ])) as any[]

    if (stories.length === 0) {
      return NextResponse.json({ error: "Story not found or expired" }, { status: 404 })
    }

    // Add view record (ignore if already viewed)
    await executeQuery("INSERT IGNORE INTO story_views (story_id, viewer_id) VALUES (?, ?)", [storyId, user.userId])

    return NextResponse.json({ message: "Story viewed" })
  } catch (error) {
    console.error("View story error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withAuth(viewStoryHandler)

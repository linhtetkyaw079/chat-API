import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { withAuth } from "@/lib/auth-middleware"

async function searchUsersHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const user = (req as any).user

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const users = (await executeQuery(
      `SELECT id, username, email, full_name, profile_picture, bio, is_online, last_seen 
       FROM users 
       WHERE (username LIKE ? OR email LIKE ? OR full_name LIKE ?) AND id != ? AND is_verified = TRUE
       LIMIT 20`,
      [`%${query}%`, `%${query}%`, `%${query}%`, user.userId],
    )) as any[]

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Search users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(searchUsersHandler)

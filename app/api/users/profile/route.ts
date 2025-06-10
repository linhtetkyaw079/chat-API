import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { withAuth } from "@/lib/auth-middleware"

async function getProfileHandler(req: NextRequest) {
  try {
    const user = (req as any).user

    const users = (await executeQuery(
      "SELECT id, username, email, full_name, profile_picture, bio, is_online, last_seen, created_at FROM users WHERE id = ?",
      [user.userId],
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function updateProfileHandler(req: NextRequest) {
  try {
    const { fullName, bio, profilePicture } = await req.json()
    const user = (req as any).user

    await executeQuery("UPDATE users SET full_name = ?, bio = ?, profile_picture = ? WHERE id = ?", [
      fullName,
      bio,
      profilePicture,
      user.userId,
    ])

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getProfileHandler)
export const PUT = withAuth(updateProfileHandler)

import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { executeQuery } from "@/lib/database"
import { withAuth } from "@/lib/auth-middleware"

async function changePasswordHandler(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json()
    const user = (req as any).user

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new passwords are required" }, { status: 400 })
    }

    // Get current password hash
    const users = (await executeQuery("SELECT password_hash FROM users WHERE id = ?", [user.userId])) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    // Update password
    await executeQuery("UPDATE users SET password_hash = ? WHERE id = ?", [newPasswordHash, user.userId])

    return NextResponse.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withAuth(changePasswordHandler)

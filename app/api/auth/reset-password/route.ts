import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { executeQuery } from "@/lib/database"

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Find user with valid reset code
    const users = (await executeQuery(
      "SELECT id FROM users WHERE email = ? AND reset_code = ? AND reset_code_expires > NOW()",
      [email, code],
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 })
    }

    const user = users[0]

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update password and clear reset code
    await executeQuery(
      "UPDATE users SET password_hash = ?, reset_code = NULL, reset_code_expires = NULL WHERE id = ?",
      [passwordHash, user.id],
    )

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

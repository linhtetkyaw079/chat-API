import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { sendPasswordResetEmail } from "@/lib/mailer"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find user
    const users = (await executeQuery("SELECT id, full_name FROM users WHERE email = ?", [email])) as any[]

    if (users.length === 0) {
      // Don't reveal if email exists or not
      return NextResponse.json({ message: "If the email exists, a reset code has been sent." })
    }

    const user = users[0]

    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Update user with reset code
    await executeQuery("UPDATE users SET reset_code = ?, reset_code_expires = ? WHERE id = ?", [
      resetCode,
      expiresAt,
      user.id,
    ])

    // Send reset email
    await sendPasswordResetEmail(email, resetCode, user.full_name)

    return NextResponse.json({ message: "If the email exists, a reset code has been sent." })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

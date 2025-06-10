import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { createJWT } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    // Find user with verification code
    const users = (await executeQuery(
      "SELECT id, username, email, full_name, verification_code FROM users WHERE email = ? AND verification_code = ?",
      [email, code],
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    const user = users[0]

    // Update user as verified
    await executeQuery("UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE id = ?", [user.id])

    // Create JWT token
    const token = createJWT({
      userId: user.id,
      email: user.email,
      username: user.username,
    })

    return NextResponse.json({
      message: "Email verified successfully",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
      },
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

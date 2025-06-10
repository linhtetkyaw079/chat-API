import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { executeQuery } from "@/lib/database"
import { createJWT } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const users = (await executeQuery(
      "SELECT id, username, email, password_hash, full_name, is_verified FROM users WHERE email = ?",
      [email],
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Check if email is verified
    if (!user.is_verified) {
      return NextResponse.json({ error: "Please verify your email first" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update online status
    await executeQuery("UPDATE users SET is_online = TRUE, last_seen = NOW() WHERE id = ?", [user.id])

    // Create JWT token
    const token = createJWT({
      userId: user.id,
      email: user.email,
      username: user.username,
    })

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

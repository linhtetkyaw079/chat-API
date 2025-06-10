import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { executeQuery } from "@/lib/database"
import { sendVerificationEmail } from "@/lib/mailer"

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, fullName } = await req.json()

    // Validate input
    if (!username || !email || !password || !fullName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await executeQuery("SELECT id FROM users WHERE email = ? OR username = ?", [email, username])

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Insert user
    await executeQuery(
      `INSERT INTO users (username, email, password_hash, full_name, verification_code) 
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, passwordHash, fullName, verificationCode],
    )

    // Send verification email
    await sendVerificationEmail(email, verificationCode, fullName)

    return NextResponse.json({
      message: "User registered successfully. Please check your email for verification code.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

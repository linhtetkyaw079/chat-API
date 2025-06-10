import nodemailer from "nodemailer"

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(email: string, code: string, name: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@chatapp.com",
    to: email,
    subject: "Verify Your Email - Chat App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Chat App, ${name}!</h2>
        <p>Please verify your email address by entering this code:</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendPasswordResetEmail(email: string, code: string, name: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@chatapp.com",
    to: email,
    subject: "Password Reset - Chat App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Use this code to reset your password:</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
          ${code}
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

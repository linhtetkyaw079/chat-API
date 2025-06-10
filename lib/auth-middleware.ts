import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT, extractTokenFromHeader } from "./jwt"

export function withAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const authHeader = req.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    // Add user info to request
    ;(req as any).user = payload
    return handler(req, ...args)
  }
}

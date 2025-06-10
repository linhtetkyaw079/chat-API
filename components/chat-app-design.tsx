"use client"

import { useState } from "react"
import AuthScreen from "./auth-screen"
import ChatInterface from "./chat-interface"

export default function ChatAppDesign() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticate={() => setIsAuthenticated(true)} />
  }

  return <ChatInterface onLogout={() => setIsAuthenticated(false)} />
}

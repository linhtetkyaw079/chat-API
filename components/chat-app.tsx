"use client"

import { useState } from "react"
import AuthScreen from "./auth/auth-screen"
import MobileLayout from "./layouts/mobile-layout"
import { UserProvider } from "@/contexts/user-context"
import { ThemeProvider } from "@/components/theme-provider"

export default function ChatApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <ThemeProvider defaultTheme="light" storageKey="chat-app-theme">
      <UserProvider>
        {!isAuthenticated ? (
          <AuthScreen onAuthenticate={() => setIsAuthenticated(true)} />
        ) : (
          <MobileLayout onLogout={() => setIsAuthenticated(false)} />
        )}
      </UserProvider>
    </ThemeProvider>
  )
}

"use client"

import { useEffect, useState } from "react"
import LoginScreen from "./login-screen"
import ChatInterface from "./chat-interface"
import { IndexedDBManager } from "@/lib/db-manager"
import { Toaster } from "./ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { UserProvider } from "@/contexts/user-context"

export default function ChatApplication() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { toast } = useToast()
  const storageManager = new IndexedDBManager()

  useEffect(() => {
    const migrateData = async () => {
      try {
        await storageManager.migrateFromLocalStorage()
      } catch (error) {
        console.error("Migration error:", error)
      }
    }

    migrateData()
  }, [])

  useEffect(() => {
    // Check if user is already logged in
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true)
        const currentUser = storageManager.getCurrentUser()
        if (currentUser) {
          setIsLoggedIn(true)
          await storageManager.updateUserStatus(currentUser.username, true)
        }
      } catch (error) {
        console.error("Error checking login status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkLoginStatus()

    // Set up "last active" tracker for user presence
    const updateLastActive = async () => {
      const currentUser = storageManager.getCurrentUser()
      if (currentUser) {
        await storageManager.updateLastActive(currentUser.username)
      }
    }

    // Update last active time periodically
    const intervalId = setInterval(updateLastActive, 60000)
    window.addEventListener("focus", updateLastActive)

    // Set up beforeunload event to update user status when leaving
    const handleBeforeUnload = async () => {
      const currentUser = storageManager.getCurrentUser()
      if (currentUser) {
        await storageManager.updateUserStatus(currentUser.username, false)
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("focus", updateLastActive)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const handleLogin = (username: string) => {
    setIsLoggedIn(true)
    toast({
      title: "Login Successful",
      description: `Welcome back, ${username}!`,
    })
  }

  const handleLogout = async () => {
    const currentUser = storageManager.getCurrentUser()
    if (currentUser) {
      await storageManager.updateUserStatus(currentUser.username, false)
      storageManager.clearCurrentUser()
    }
    setIsLoggedIn(false)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-emerald-500 border-b-emerald-700 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {isLoggedIn ? <ChatInterface onLogout={handleLogout} /> : <LoginScreen onLoginSuccess={handleLogin} />}
        <Toaster />
      </div>
    </UserProvider>
  )
}

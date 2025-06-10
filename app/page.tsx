"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ChatLayout from "@/components/chat-layout"
import AuthForm from "@/components/auth-form"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      // Verify token with backend
      fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) {
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem("token")
          }
        })
        .catch(() => {
          localStorage.removeItem("token")
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthForm onAuthenticated={() => setIsAuthenticated(true)} />
  }

  return <ChatLayout />
}

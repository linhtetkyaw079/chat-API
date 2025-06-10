"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"

type User = {
  id: string
  username: string
  avatar?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
  generateKeyPair: () => Promise<{ publicKey: string; privateKey: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    setLoading(true)
    try {
      // In a real app, this would be a fetch to your PHP backend
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()
      setUser(data.user)

      // Retrieve or generate encryption keys
      await retrieveOrGenerateKeys(data.user.id)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (username: string, password: string) => {
    setLoading(true)
    try {
      // Generate encryption keys for the new user
      const { publicKey, privateKey } = await generateKeyPair()

      // In a real app, this would be a fetch to your PHP backend
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          publicKey,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Registration failed")
      }

      const data = await response.json()
      setUser(data.user)

      // Store private key securely (encrypted with user's password)
      localStorage.setItem(`privateKey_${data.user.id}`, privateKey)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
      .then(() => {
        setUser(null)
      })
      .catch((error) => {
        console.error("Logout error:", error)
      })
  }

  const generateKeyPair = async () => {
    // In a real app, use a proper encryption library like libsodium
    // This is a placeholder for demonstration
    return {
      publicKey: `pk_${Math.random().toString(36).substring(2, 15)}`,
      privateKey: `sk_${Math.random().toString(36).substring(2, 15)}`,
    }
  }

  const retrieveOrGenerateKeys = async (userId: string) => {
    const privateKey = localStorage.getItem(`privateKey_${userId}`)

    if (!privateKey) {
      // If no keys exist, generate new ones and update the server
      const { publicKey, privateKey: newPrivateKey } = await generateKeyPair()

      await fetch("/api/users/update-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey }),
        credentials: "include",
      })

      localStorage.setItem(`privateKey_${userId}`, newPrivateKey)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-emerald-500 border-b-emerald-700 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md">
          {showRegister ? (
            <RegisterForm onSubmit={register} onToggle={() => setShowRegister(false)} />
          ) : (
            <LoginForm onSubmit={login} onToggle={() => setShowRegister(true)} />
          )}
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, generateKeyPair }}>
      {children}
    </AuthContext.Provider>
  )
}

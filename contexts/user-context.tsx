"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface UserContextType {
  currentUser: {
    id: string
    name: string
    username: string
    avatar?: string
  } | null
  setCurrentUser: (user: UserContextType["currentUser"]) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserContextType["currentUser"]>({
    id: "current-user",
    name: "John Doe",
    username: "johndoe",
    avatar: "/placeholder.svg?height=40&width=40",
  })

  return <UserContext.Provider value={{ currentUser, setCurrentUser }}>{children}</UserContext.Provider>
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}

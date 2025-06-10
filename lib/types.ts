export interface User {
  id: string
  name: string
  avatar?: string
  email?: string
  isOnline: boolean
  lastSeen?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isChannel?: boolean
}

export interface Channel {
  id: string
  name: string
  description: string
  avatar: string
  memberCount: number
  lastMessageTime: string
  unreadCount: number
  verified: boolean
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  status: "sent" | "delivered" | "read"
}

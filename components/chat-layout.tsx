"use client"

import { useState, useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Search, Plus, MoreVertical, Phone, Video } from "lucide-react"

interface User {
  id: number
  username: string
  email: string
  fullName: string
  profilePicture?: string
  isOnline?: boolean
}

interface Message {
  id: number
  content: string
  messageType: string
  fileUrl?: string
  createdAt: string
  senderId: number
  senderUsername: string
  senderName: string
  senderPicture?: string
}

interface Conversation {
  id: number
  type: string
  name?: string
  otherUserName?: string
  otherUsername?: string
  otherProfilePicture?: string
  otherIsOnline?: boolean
  lastMessage?: string
  lastMessageTime?: string
}

export default function ChatLayout() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (token && user) {
      setCurrentUser(JSON.parse(user))

      // Initialize socket connection
      const newSocket = io({
        auth: { token },
      })

      newSocket.on("connect", () => {
        console.log("Connected to server")
        setSocket(newSocket)
      })

      newSocket.on("new_message", (data) => {
        if (data.conversationId === selectedConversation?.id) {
          setMessages((prev) => [...prev, data.message])
        }
        // Update conversation list
        loadConversations()
      })

      newSocket.on("user_typing", (data) => {
        if (data.conversationId === selectedConversation?.id) {
          setTypingUsers((prev) => new Set([...prev, data.userId]))
        }
      })

      newSocket.on("user_stop_typing", (data) => {
        if (data.conversationId === selectedConversation?.id) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev)
            newSet.delete(data.userId)
            return newSet
          })
        }
      })

      return () => {
        newSocket.disconnect()
      }
    }
  }, [selectedConversation?.id])

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    }
  }

  const loadMessages = async (conversationId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !socket) return

    const messageData = {
      conversationId: selectedConversation.id,
      content: newMessage,
      messageType: "text",
    }

    socket.emit("send_message", messageData)
    setNewMessage("")

    // Stop typing indicator
    socket.emit("typing_stop", { conversationId: selectedConversation.id })
  }

  const handleTyping = () => {
    if (!socket || !selectedConversation) return

    socket.emit("typing_start", { conversationId: selectedConversation.id })

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId: selectedConversation.id })
    }, 1000)
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users)
      }
    } catch (error) {
      console.error("Failed to search users:", error)
    }
  }

  const startConversation = async (userId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "private",
          participantIds: [userId],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        loadConversations()
        setSearchQuery("")
        setSearchResults([])
      }
    } catch (error) {
      console.error("Failed to start conversation:", error)
    }
  }

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    loadMessages(conversation.id)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.reload()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Chats</h1>
            <div className="flex space-x-2">
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={logout}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchUsers()}
              className="pl-10"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Search Results</h3>
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => startConversation(user.id)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
                {user.isOnline && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Conversations */}
        <ScrollArea className="flex-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer ${
                selectedConversation?.id === conversation.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
              }`}
              onClick={() => selectConversation(conversation)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={conversation.otherProfilePicture || "/placeholder.svg"} />
                <AvatarFallback>
                  {conversation.type === "group" ? conversation.name?.charAt(0) : conversation.otherUserName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {conversation.type === "group" ? conversation.name : conversation.otherUserName}
                  </p>
                  {conversation.lastMessageTime && (
                    <p className="text-xs text-gray-500">{formatTime(conversation.lastMessageTime)}</p>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{conversation.lastMessage || "No messages yet"}</p>
                {conversation.type === "private" && conversation.otherIsOnline && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs mt-1">
                    Online
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.otherProfilePicture || "/placeholder.svg"} />
                    <AvatarFallback>
                      {selectedConversation.type === "group"
                        ? selectedConversation.name?.charAt(0)
                        : selectedConversation.otherUserName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedConversation.type === "group"
                        ? selectedConversation.name
                        : selectedConversation.otherUserName}
                    </h2>
                    {selectedConversation.type === "private" && (
                      <p className="text-sm text-gray-500">
                        {selectedConversation.otherIsOnline ? "Online" : "Last seen recently"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === currentUser?.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      {message.senderId !== currentUser?.id && selectedConversation.type === "group" && (
                        <p className="text-xs font-medium mb-1">{message.senderName}</p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === currentUser?.id ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                      <p className="text-sm">Someone is typing...</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    handleTyping()
                  }}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Welcome to Chat App</h2>
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

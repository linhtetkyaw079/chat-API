"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoreVertical, Send, Paperclip, Smile, Mic, ImageIcon, Video, File } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { mockMessages } from "@/lib/mock-data"
import type { User } from "@/lib/types"

interface ChatViewProps {
  user: User
  onBack: () => void
}

export default function ChatView({ user, onBack }: ChatViewProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(
    mockMessages.filter(
      (msg) =>
        (msg.senderId === user.id && msg.receiverId === "current-user") ||
        (msg.senderId === "current-user" && msg.receiverId === user.id),
    ),
  )
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: "current-user",
      receiverId: user.id,
      content: message,
      timestamp: new Date().toISOString(),
      status: "sent",
    }

    setMessages([...messages, newMessage])
    setMessage("")

    // Simulate received message after a delay
    setTimeout(() => {
      const responseMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: user.id,
        receiverId: "current-user",
        content: `This is an automated response to: "${message}"`,
        timestamp: new Date().toISOString(),
        status: "delivered",
      }
      setMessages((prev) => [...prev, responseMessage])
    }, 2000)
  }

  // Format timestamp for display
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, any[]>, message) => {
    const date = new Date(message.timestamp).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  return (
    <div className="flex flex-col h-full">
      {/* Chat header for desktop */}
      <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium">{user.name}</h2>
            <p className="text-xs text-gray-500">
              {user.isOnline ? "Online" : "Last seen " + (user.lastSeen || "recently")}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Search</DropdownMenuItem>
              <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem>Block User</DropdownMenuItem>
              <DropdownMenuItem>Clear Chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex justify-center mb-4">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                  {date === new Date().toLocaleDateString() ? "Today" : date}
                </span>
              </div>
              <div className="space-y-3">
                {dateMessages.map((message) => {
                  const isCurrentUser = message.senderId === "current-user"
                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                          <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[75%] ${isCurrentUser ? "text-right" : "text-left"}`}>
                        <div
                          className={`inline-block rounded-lg p-3 ${
                            isCurrentUser
                              ? "bg-teal-600 text-white rounded-br-none"
                              : "bg-white dark:bg-gray-800 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500 space-x-1">
                          <span>{formatMessageTime(message.timestamp)}</span>
                          {isCurrentUser && (
                            <span>
                              {message.status === "sent" && "✓"}
                              {message.status === "delivered" && "✓✓"}
                              {message.status === "read" && <span className="text-teal-500">✓✓</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            {showAttachMenu && (
              <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700 flex space-x-2">
                <Button variant="ghost" size="icon" className="rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <File className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              className="w-full rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full"
            >
              <Smile className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
          {message.trim() ? (
            <Button type="submit" size="icon" className="rounded-full bg-teal-600 hover:bg-teal-700">
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <Button type="button" size="icon" className="rounded-full bg-teal-600 hover:bg-teal-700">
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}

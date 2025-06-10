"use client"

import { useRef, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "@/lib/date-utils"
import type { Message, User } from "@/lib/types"
import { CheckIcon, CheckCheck } from "lucide-react"

interface ChatWindowProps {
  messages: Message[]
  currentUser: User
  selectedUser: User
}

export default function ChatWindow({ messages, currentUser, selectedUser }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, message) => {
    const date = new Date(message.timestamp).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  return (
    <div className="flex-1 overflow-y-auto p-4" aria-label="Chat messages">
      {Object.entries(groupedMessages).length > 0 ? (
        Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="mb-6">
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                {date === new Date().toLocaleDateString() ? "Today" : date}
              </span>
            </div>
            <div className="space-y-3">
              {dateMessages.map((message) => {
                const isCurrentUser = message.senderId === currentUser.username
                // Display decrypted content for current user's messages, or if message is not encrypted
                const displayContent =
                  isCurrentUser && message.originalContent
                    ? message.originalContent
                    : !message.isEncrypted
                      ? message.content
                      : "(Encrypted message)"

                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div className="flex max-w-[80%]">
                      {!isCurrentUser && (
                        <div className="flex-shrink-0 mr-2 self-end mb-1">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-emerald-200 text-emerald-700 text-xs">
                              {selectedUser.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      <div>
                        <div
                          className={`p-3 rounded-lg ${
                            isCurrentUser
                              ? "bg-emerald-600 text-white rounded-br-none"
                              : "bg-gray-200 dark:bg-gray-700 rounded-bl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{displayContent}</p>
                        </div>
                        <div
                          className={`flex items-center mt-1 text-xs text-gray-500 ${
                            isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span>{formatDistanceToNow(new Date(message.timestamp))}</span>
                          {isCurrentUser && (
                            <span className="ml-1">
                              {message.isRead ? (
                                <CheckCheck className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <CheckIcon className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

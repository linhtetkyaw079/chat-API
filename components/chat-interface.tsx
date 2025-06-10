"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, LogOut, Menu, MoreVertical, Phone, Search, Send, Users, Video, X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { mockUsers, mockMessages } from "@/lib/mock-data"

interface ChatInterfaceProps {
  onLogout: () => void
}

export default function ChatInterface({ onLogout }: ChatInterfaceProps) {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0])
  const [messages, setMessages] = useState(mockMessages)
  const [messageInput, setMessageInput] = useState("")
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Filter users based on search query
  const filteredUsers = mockUsers.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: "current-user",
      receiverId: selectedUser.id,
      content: messageInput,
      timestamp: new Date().toISOString(),
      status: "sent",
    }

    setMessages([...messages, newMessage])
    setMessageInput("")

    // Simulate received message after a delay
    setTimeout(() => {
      const responseMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: selectedUser.id,
        receiverId: "current-user",
        content: `This is an automated response to: "${messageInput}"`,
        timestamp: new Date().toISOString(),
        status: "delivered",
      }
      setMessages((prev) => [...prev, responseMessage])
    }, 2000)
  }

  // Mark messages as read when selecting a user
  useEffect(() => {
    if (selectedUser) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === selectedUser.id && msg.status === "delivered" ? { ...msg, status: "read" } : msg,
        ),
      )

      // On mobile, hide sidebar after selecting a user
      if (isMobile) {
        setShowSidebar(false)
      }
    }
  }, [selectedUser, isMobile])

  // Get unread message count for a user
  const getUnreadCount = (userId: string) => {
    return messages.filter((msg) => msg.senderId === userId && msg.status === "delivered").length
  }

  // Filter messages for the selected conversation
  const conversationMessages = messages.filter(
    (msg) =>
      (msg.senderId === selectedUser.id && msg.receiverId === "current-user") ||
      (msg.senderId === "current-user" && msg.receiverId === selectedUser.id),
  )

  // Format timestamp for display
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
          {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div className="flex items-center">
          {selectedUser && (
            <>
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{selectedUser.name}</span>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:static inset-y-0 left-0 z-20 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out",
          isMobile && !showSidebar ? "-translate-x-full" : "translate-x-0",
          "md:translate-x-0 pt-14 md:pt-0 flex flex-col h-full",
        )}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={onLogout}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Logout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search conversations..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex-1">
                Groups
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <TabsContent value="all" className="m-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => {
                  const unreadCount = getUnreadCount(user.id)
                  return (
                    <button
                      key={user.id}
                      className={cn(
                        "w-full flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                        selectedUser?.id === user.id && "bg-indigo-50 dark:bg-indigo-900/20",
                      )}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800",
                            user.isOnline ? "bg-green-500" : "bg-gray-400",
                          )}
                        />
                      </div>
                      <div className="ml-3 flex-1 text-left">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{user.name}</p>
                          <span className="text-xs text-gray-500">{user.lastMessageTime}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500 truncate max-w-[160px]">{user.lastMessage}</p>
                          {unreadCount > 0 && <Badge className="ml-2 bg-indigo-600">{unreadCount}</Badge>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="unread" className="m-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers
                  .filter((user) => getUnreadCount(user.id) > 0)
                  .map((user) => {
                    const unreadCount = getUnreadCount(user.id)
                    return (
                      <button
                        key={user.id}
                        className={cn(
                          "w-full flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                          selectedUser?.id === user.id && "bg-indigo-50 dark:bg-indigo-900/20",
                        )}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span
                            className={cn(
                              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800",
                              user.isOnline ? "bg-green-500" : "bg-gray-400",
                            )}
                          />
                        </div>
                        <div className="ml-3 flex-1 text-left">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{user.name}</p>
                            <span className="text-xs text-gray-500">{user.lastMessageTime}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500 truncate max-w-[160px]">{user.lastMessage}</p>
                            <Badge className="ml-2 bg-indigo-600">{unreadCount}</Badge>
                          </div>
                        </div>
                      </button>
                    )
                  })}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="m-0 p-4">
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Users className="h-10 w-10 text-gray-400 mb-2" />
                <h3 className="font-medium">No Group Chats</h3>
                <p className="text-sm text-gray-500 mt-1">Create a group to chat with multiple people at once</p>
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700">Create Group</Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col h-full md:ml-80 pt-14 md:pt-0">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">{selectedUser.name}</h2>
                  <p className="text-xs text-gray-500">
                    {selectedUser.isOnline ? "Online" : "Last seen " + selectedUser.lastSeen}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Phone className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice Call</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Video className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Video Call</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>More Options</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
              <div className="space-y-4">
                {conversationMessages.map((message) => {
                  const isCurrentUser = message.senderId === "current-user"
                  return (
                    <div key={message.id} className={cn("flex", isCurrentUser ? "justify-end" : "justify-start")}>
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                          <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                          <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("max-w-[70%]", isCurrentUser && "text-right")}>
                        <div
                          className={cn(
                            "inline-block rounded-lg p-3",
                            isCurrentUser
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-white dark:bg-gray-800 rounded-bl-none",
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500 space-x-1">
                          <span>{formatMessageTime(message.timestamp)}</span>
                          {isCurrentUser && (
                            <span>
                              {message.status === "sent" && "✓"}
                              {message.status === "delivered" && "✓✓"}
                              {message.status === "read" && <span className="text-indigo-500">✓✓</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={!messageInput.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="bg-indigo-100 dark:bg-indigo-900/20 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-10 w-10 text-indigo-600 dark:text-indigo-400"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose a contact from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {showSidebar && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={() => setShowSidebar(false)} />
      )}
    </div>
  )
}

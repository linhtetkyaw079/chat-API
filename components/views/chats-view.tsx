"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { mockUsers, mockChannels } from "@/lib/mock-data"

interface ChatsViewProps {
  onChatSelect: (chatId: string) => void
  searchQuery: string
}

export default function ChatsView({ onChatSelect, searchQuery }: ChatsViewProps) {
  const [activeTab, setActiveTab] = useState("all")

  // Filter users based on search query
  const filteredUsers = mockUsers.filter(
    (user) =>
      searchQuery === "" ||
      searchQuery === "search" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter channels based on search query
  const filteredChannels = mockChannels.filter(
    (channel) =>
      searchQuery === "" ||
      searchQuery === "search" ||
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-2">
          <TabsContent value="all" className="m-0 mt-4">
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => onChatSelect(user.id)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        user.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{user.name}</p>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{user.lastMessageTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 truncate max-w-[180px]">{user.lastMessage}</p>
                      {user.unreadCount > 0 && (
                        <Badge className="ml-2 bg-teal-500 hover:bg-teal-600">{user.unreadCount}</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="private" className="m-0 mt-4">
            <div className="space-y-1">
              {filteredUsers
                .filter((user) => !user.isChannel)
                .map((user) => (
                  <button
                    key={user.id}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => onChatSelect(user.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                          user.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">{user.name}</p>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{user.lastMessageTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 truncate max-w-[180px]">{user.lastMessage}</p>
                        {user.unreadCount > 0 && (
                          <Badge className="ml-2 bg-teal-500 hover:bg-teal-600">{user.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="channels" className="m-0 mt-4">
            <div className="space-y-1">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => onChatSelect(channel.id)}
                >
                  <Avatar className="h-12 w-12 bg-teal-100 dark:bg-teal-900">
                    <AvatarFallback className="text-teal-700 dark:text-teal-300 font-medium">
                      {channel.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <p className="font-medium truncate">{channel.name}</p>
                        {channel.verified && (
                          <svg
                            className="ml-1 h-4 w-4 text-teal-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{channel.lastMessageTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 truncate max-w-[180px]">{channel.description}</p>
                      {channel.unreadCount > 0 && (
                        <Badge className="ml-2 bg-teal-500 hover:bg-teal-600">{channel.unreadCount}</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              <div className="p-4 flex justify-center">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4 mr-2" /> Create Channel
                </Button>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}

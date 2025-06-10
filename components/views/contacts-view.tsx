"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, UserPlus, UserMinus, MoreVertical, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { mockUsers } from "@/lib/mock-data"

interface ContactsViewProps {
  searchQuery: string
}

export default function ContactsView({ searchQuery }: ContactsViewProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [friendStatus, setFriendStatus] = useState<Record<string, string>>({})

  // Filter users based on search query
  const filteredUsers = mockUsers.filter(
    (user) =>
      searchQuery === "" ||
      searchQuery === "search" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleAddFriend = (userId: string) => {
    setFriendStatus((prev) => ({ ...prev, [userId]: "pending" }))
  }

  const handleRemoveFriend = (userId: string) => {
    setFriendStatus((prev) => ({ ...prev, [userId]: "removed" }))
  }

  const handleAcceptFriend = (userId: string) => {
    setFriendStatus((prev) => ({ ...prev, [userId]: "accepted" }))
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-2">
          <TabsContent value="all" className="m-0 mt-4">
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {user.email || `@${user.name.toLowerCase().replace(/\s/g, "")}`}
                      </p>
                    </div>
                  </div>
                  <div>
                    {friendStatus[user.id] === "pending" ? (
                      <Button variant="outline" size="sm" className="text-yellow-600" disabled>
                        Pending
                      </Button>
                    ) : friendStatus[user.id] === "accepted" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRemoveFriend(user.id)}>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove Friend
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : friendStatus[user.id] === "removed" ? (
                      <Button variant="outline" size="sm" onClick={() => handleAddFriend(user.id)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleAddFriend(user.id)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="friends" className="m-0 mt-4">
            <div className="space-y-1">
              {filteredUsers
                .filter((user) => friendStatus[user.id] === "accepted")
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">
                          {user.email || `@${user.name.toLowerCase().replace(/\s/g, "")}`}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRemoveFriend(user.id)}>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove Friend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              {filteredUsers.filter((user) => friendStatus[user.id] === "accepted").length === 0 && (
                <div className="p-8 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <Users className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium">No friends yet</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">Add friends to start chatting with them</p>
                  <Button className="bg-teal-600 hover:bg-teal-700">Find Friends</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="m-0 mt-4">
            <div className="space-y-1">
              {filteredUsers
                .filter((user) => friendStatus[user.id] === "pending")
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">
                          {user.email || `@${user.name.toLowerCase().replace(/\s/g, "")}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => handleAcceptFriend(user.id)}
                      >
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRemoveFriend(user.id)}>
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              {filteredUsers.filter((user) => friendStatus[user.id] === "pending").length === 0 && (
                <div className="p-8 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <UserPlus className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium">No pending requests</h3>
                  <p className="text-sm text-gray-500 mt-1">Friend requests you've sent or received will appear here</p>
                </div>
              )}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button className="w-full bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" /> Add New Contact
        </Button>
      </div>
    </div>
  )
}

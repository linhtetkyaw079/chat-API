"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Home, Users, Settings, Search, MessageSquare, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import ChatsView from "@/components/views/chats-view"
import ContactsView from "@/components/views/contacts-view"
import SettingsView from "@/components/views/settings-view"
import ChatView from "@/components/views/chat-view"
import { mockUsers } from "@/lib/mock-data"

interface MobileLayoutProps {
  onLogout: () => void
}

export default function MobileLayout({ onLogout }: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState("chats")
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()

  // Reset selected chat when changing tabs
  useEffect(() => {
    if (activeTab !== "chats") {
      setSelectedChat(null)
    }
  }, [activeTab])

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId)
  }

  const handleBackToChats = () => {
    setSelectedChat(null)
  }

  const renderView = () => {
    if (selectedChat) {
      const selectedUser = mockUsers.find((user) => user.id === selectedChat)
      return selectedUser ? <ChatView user={selectedUser} onBack={handleBackToChats} /> : null
    }

    switch (activeTab) {
      case "chats":
        return <ChatsView onChatSelect={handleChatSelect} searchQuery={searchQuery} />
      case "contacts":
        return <ContactsView searchQuery={searchQuery} />
      case "settings":
        return <SettingsView onLogout={onLogout} />
      default:
        return <ChatsView onChatSelect={handleChatSelect} searchQuery={searchQuery} />
    }
  }

  const isInChatView = selectedChat !== null

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            {isInChatView ? (
              <Button variant="ghost" size="icon" onClick={handleBackToChats} className="mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
            ) : (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center space-x-4 p-4 border-b">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="font-medium">John Doe</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@johndoe</p>
                      </div>
                    </div>
                    <nav className="flex-1 p-4">
                      <ul className="space-y-2">
                        <li>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              setActiveTab("chats")
                              document.body.click() // Close the sheet
                            }}
                          >
                            <MessageSquare className="mr-2 h-5 w-5" />
                            All Chats
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              setActiveTab("contacts")
                              document.body.click() // Close the sheet
                            }}
                          >
                            <Users className="mr-2 h-5 w-5" />
                            Contacts
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              setActiveTab("settings")
                              document.body.click() // Close the sheet
                            }}
                          >
                            <Settings className="mr-2 h-5 w-5" />
                            Settings
                          </Button>
                        </li>
                      </ul>
                    </nav>
                    <div className="p-4 border-t">
                      <ModeToggle />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <h1 className="text-xl font-bold">
              {isInChatView
                ? mockUsers.find((user) => user.id === selectedChat)?.name || "Chat"
                : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          </div>
          {!isInChatView && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setSearchQuery(searchQuery ? "" : "search")}>
                <Search className="h-5 w-5" />
              </Button>
              <ModeToggle />
            </div>
          )}
        </div>
        {searchQuery === "search" && !isInChatView && (
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                autoFocus
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${selectedChat}`}
            initial={{ opacity: 0, x: isInChatView ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isInChatView ? -20 : 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {!isInChatView && (
        <nav className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-around items-center h-16">
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full ${activeTab === "chats" ? "text-teal-600 dark:text-teal-400" : ""}`}
              onClick={() => setActiveTab("chats")}
            >
              <Home className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full ${activeTab === "contacts" ? "text-teal-600 dark:text-teal-400" : ""}`}
              onClick={() => setActiveTab("contacts")}
            >
              <Users className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full ${activeTab === "settings" ? "text-teal-600 dark:text-teal-400" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="h-6 w-6" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell, Lock, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react"

interface SettingsViewProps {
  onLogout: () => void
}

export default function SettingsView({ onLogout }: SettingsViewProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(true)

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder.svg?height=64&width=64" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-bold text-lg">John Doe</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">@johndoe</p>
          </div>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </div>

        {/* Appearance Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Appearance</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
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
                    className="text-gray-600 dark:text-gray-300"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Change the app theme</p>
                </div>
              </div>
              <ModeToggle />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Notifications
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new messages</p>
                </div>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
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
                    className="text-gray-600 dark:text-gray-300"
                  >
                    <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
                    <line x1="2" y1="20" x2="2" y2="20" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Sound</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Play sound for new messages</p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Privacy</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                  <Lock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="font-medium">Read Receipts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Let others know when you've read their messages
                  </p>
                </div>
              </div>
              <Switch checked={readReceiptsEnabled} onCheckedChange={setReadReceiptsEnabled} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                  <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="font-medium">Privacy Settings</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your privacy preferences</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Help</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                  <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="font-medium">Help Center</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get help with using the app</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button variant="destructive" className="w-full flex items-center justify-center" onClick={onLogout}>
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 pb-8">
          <p>WaveChat v1.0.0</p>
          <p className="mt-1">© 2023 WaveChat. All rights reserved.</p>
        </div>
      </div>
    </ScrollArea>
  )
}

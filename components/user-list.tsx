"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { User } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@/lib/date-utils"

interface UserListProps {
  users: User[]
  selectedUser: User | null
  onSelectUser: (user: User) => void
  unreadCounts: Record<string, number>
}

export default function UserList({ users, selectedUser, onSelectUser, unreadCounts }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">No other users found</p>
        <div className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-w-[250px]">
          <p>Since this is a local demo, you need to create multiple accounts to simulate chat between users.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Contacts</h2>
        <ul className="space-y-1">
          {users.map((user) => (
            <li key={user.username}>
              <button
                onClick={() => onSelectUser(user)}
                className={`w-full flex items-center p-2 rounded-lg transition-colors ${
                  selectedUser?.username === user.username
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarFallback className="bg-emerald-200 text-emerald-700">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                      user.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">{user.username}</p>
                    {unreadCounts[user.username] > 0 && (
                      <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                        {unreadCounts[user.username]}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.isOnline
                      ? "Online"
                      : user.lastActive
                        ? `Last seen ${formatDistanceToNow(new Date(user.lastActive))}`
                        : "Offline"}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

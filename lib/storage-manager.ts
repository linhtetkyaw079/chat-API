import type { User, Message } from "./types"

export class LocalStorageManager {
  private readonly USER_PREFIX = "chat_app_user_"
  private readonly MESSAGES_KEY = "chat_app_messages"
  private readonly CURRENT_USER_KEY = "chat_app_current_user"

  constructor() {
    // Initialize localStorage if needed
    if (!localStorage.getItem(this.MESSAGES_KEY)) {
      localStorage.setItem(this.MESSAGES_KEY, JSON.stringify([]))
    }
  }

  // User Management

  createUser(username: string, passwordHash: string, publicKey: string, privateKey: string): User {
    const user: User = {
      username,
      passwordHash,
      publicKey,
      privateKey, // In reality, this would be encrypted with the user's password
      isOnline: true,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(`${this.USER_PREFIX}${username}`, JSON.stringify(user))
    this.setCurrentUser(user)
    return user
  }

  getUserByUsername(username: string): User | null {
    const userData = localStorage.getItem(`${this.USER_PREFIX}${username}`)
    return userData ? JSON.parse(userData) : null
  }

  getAllUsers(): User[] {
    const users: User[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.USER_PREFIX)) {
        const userData = localStorage.getItem(key)
        if (userData) {
          users.push(JSON.parse(userData))
        }
      }
    }
    return users
  }

  checkUserExists(username: string): boolean {
    return localStorage.getItem(`${this.USER_PREFIX}${username}`) !== null
  }

  loginUser(username: string, passwordHash: string): boolean {
    const user = this.getUserByUsername(username)

    if (user && user.passwordHash === passwordHash) {
      user.isOnline = true
      user.lastActive = new Date().toISOString()
      localStorage.setItem(`${this.USER_PREFIX}${username}`, JSON.stringify(user))
      this.setCurrentUser(user)
      return true
    }

    return false
  }

  updateUserStatus(username: string, isOnline: boolean): void {
    const user = this.getUserByUsername(username)
    if (user) {
      user.isOnline = isOnline
      user.lastActive = new Date().toISOString()
      localStorage.setItem(`${this.USER_PREFIX}${username}`, JSON.stringify(user))
    }
  }

  updateLastActive(username: string): void {
    const user = this.getUserByUsername(username)
    if (user) {
      user.lastActive = new Date().toISOString()
      localStorage.setItem(`${this.USER_PREFIX}${username}`, JSON.stringify(user))
    }
  }

  // Current User Management

  setCurrentUser(user: User): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY)
    return userData ? JSON.parse(userData) : null
  }

  clearCurrentUser(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY)
  }

  // Message Management

  addMessage(message: Message): void {
    const messagesJson = localStorage.getItem(this.MESSAGES_KEY)
    const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : []
    messages.push(message)
    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages))
  }

  getMessages(user1: string, user2: string): Message[] {
    const messagesJson = localStorage.getItem(this.MESSAGES_KEY)
    const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : []

    return messages
      .filter(
        (message) =>
          (message.senderId === user1 && message.receiverId === user2) ||
          (message.senderId === user2 && message.receiverId === user1),
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  markMessagesAsRead(currentUser: string, fromUser: string): void {
    const messagesJson = localStorage.getItem(this.MESSAGES_KEY)
    const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : []

    const updatedMessages = messages.map((message) => {
      if (message.senderId === fromUser && message.receiverId === currentUser && !message.isRead) {
        return { ...message, isRead: true }
      }
      return message
    })

    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(updatedMessages))
  }

  markMessageAsRead(messageId: string): void {
    const messagesJson = localStorage.getItem(this.MESSAGES_KEY)
    const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : []

    const updatedMessages = messages.map((message) => {
      if (message.id === messageId) {
        return { ...message, isRead: true }
      }
      return message
    })

    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(updatedMessages))
  }

  getUnreadMessageCount(currentUser: string, fromUser: string): number {
    const messagesJson = localStorage.getItem(this.MESSAGES_KEY)
    const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : []

    return messages.filter(
      (message) => message.senderId === fromUser && message.receiverId === currentUser && !message.isRead,
    ).length
  }
}

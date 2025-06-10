import { LocalStorageManager } from "@/lib/storage-manager"
import { vi, describe, it, expect, beforeEach } from "vitest"

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  }
})()

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

describe("LocalStorageManager", () => {
  let storageManager: LocalStorageManager

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    storageManager = new LocalStorageManager()
  })

  describe("User Management", () => {
    it("should create a user", () => {
      const user = storageManager.createUser("testuser", "hashedpassword", "publickey", "privatekey")

      expect(user).toEqual(
        expect.objectContaining({
          username: "testuser",
          passwordHash: "hashedpassword",
          publicKey: "publickey",
          privateKey: "privatekey",
          isOnline: true,
        }),
      )

      expect(localStorageMock.setItem).toHaveBeenCalledWith("chat_app_user_testuser", expect.any(String))
    })

    it("should get a user by username", () => {
      // Create a user first
      storageManager.createUser("testuser", "hashedpassword", "publickey", "privatekey")

      // Get the user
      const user = storageManager.getUserByUsername("testuser")

      expect(user).toEqual(
        expect.objectContaining({
          username: "testuser",
          passwordHash: "hashedpassword",
          publicKey: "publickey",
          privateKey: "privatekey",
        }),
      )
    })

    it("should return null for non-existent user", () => {
      const user = storageManager.getUserByUsername("nonexistentuser")
      expect(user).toBeNull()
    })

    it("should check if a user exists", () => {
      // Create a user first
      storageManager.createUser("testuser", "hashedpassword", "publickey", "privatekey")

      expect(storageManager.checkUserExists("testuser")).toBe(true)
      expect(storageManager.checkUserExists("nonexistentuser")).toBe(false)
    })

    it("should login a user", () => {
      // Create a user first
      storageManager.createUser("testuser", "hashedpassword", "publickey", "privatekey")

      // Login with correct credentials
      const loginResult = storageManager.loginUser("testuser", "hashedpassword")
      expect(loginResult).toBe(true)

      // Login with incorrect credentials
      const failedLoginResult = storageManager.loginUser("testuser", "wrongpassword")
      expect(failedLoginResult).toBe(false)
    })

    it("should update user status", () => {
      // Create a user first
      storageManager.createUser("testuser", "hashedpassword", "publickey", "privatekey")

      // Update status to offline
      storageManager.updateUserStatus("testuser", false)

      // Get the user and check status
      const user = storageManager.getUserByUsername("testuser")
      expect(user?.isOnline).toBe(false)
    })

    it("should update last active timestamp", () => {
      // Create a user first
      storageManager.createUser("testuser", "hashedpassword", "publickey", "privatekey")

      // Mock Date.now
      const originalDate = Date
      const mockDate = new Date("2023-01-01T12:00:00Z")
      global.Date = class extends Date {
        constructor() {
          super()
          return mockDate
        }
        static now() {
          return mockDate.getTime()
        }
      } as DateConstructor

      // Update last active
      storageManager.updateLastActive("testuser")

      // Get the user and check last active timestamp
      const user = storageManager.getUserByUsername("testuser")
      expect(user?.lastActive).toBe(mockDate.toISOString())

      // Restore original Date
      global.Date = originalDate
    })

    it("should get all users", () => {
      // Create multiple users
      storageManager.createUser("user1", "hash1", "pk1", "sk1")
      storageManager.createUser("user2", "hash2", "pk2", "sk2")
      storageManager.createUser("user3", "hash3", "pk3", "sk3")

      // Get all users
      const users = storageManager.getAllUsers()

      expect(users.length).toBe(3)
      expect(users.map((u) => u.username)).toContain("user1")
      expect(users.map((u) => u.username)).toContain("user2")
      expect(users.map((u) => u.username)).toContain("user3")
    })
  })

  describe("Current User Management", () => {
    it("should set and get current user", () => {
      const user = {
        username: "currentuser",
        passwordHash: "hash",
        publicKey: "pk",
        privateKey: "sk",
        isOnline: true,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      storageManager.setCurrentUser(user)
      const currentUser = storageManager.getCurrentUser()

      expect(currentUser).toEqual(user)
    })

    it("should clear current user", () => {
      const user = {
        username: "currentuser",
        passwordHash: "hash",
        publicKey: "pk",
        privateKey: "sk",
        isOnline: true,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      storageManager.setCurrentUser(user)
      storageManager.clearCurrentUser()
      const currentUser = storageManager.getCurrentUser()

      expect(currentUser).toBeNull()
    })
  })

  describe("Message Management", () => {
    it("should add a message", () => {
      const message = {
        id: "msg1",
        senderId: "user1",
        receiverId: "user2",
        content: "Hello!",
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      storageManager.addMessage(message)

      // Check if message was added to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith("chat_app_messages", expect.stringContaining("Hello!"))
    })

    it("should get messages between two users", () => {
      // Add messages between different users
      storageManager.addMessage({
        id: "msg1",
        senderId: "user1",
        receiverId: "user2",
        content: "Hello from user1 to user2",
        timestamp: new Date().toISOString(),
        isRead: false,
      })

      storageManager.addMessage({
        id: "msg2",
        senderId: "user2",
        receiverId: "user1",
        content: "Hello from user2 to user1",
        timestamp: new Date().toISOString(),
        isRead: false,
      })

      storageManager.addMessage({
        id: "msg3",
        senderId: "user1",
        receiverId: "user3",
        content: "Hello from user1 to user3",
        timestamp: new Date().toISOString(),
        isRead: false,
      })

      // Get messages between user1 and user2
      const messages = storageManager.getMessages("user1", "user2")

      expect(messages.length).toBe(2)
      expect(messages[0].content).toBe("Hello from user1 to user2")
      expect(messages[1].content).toBe("Hello from user2 to user1")
    })

    it("should mark messages as read", () => {
      // Add unread messages
      storageManager.addMessage({
        id: "msg1",
        senderId: "user1",
        receiverId: "user2",
        content: "Hello!",
        timestamp: new Date().toISOString(),
        isRead: false,
      })

      // Mark messages as read
      storageManager.markMessagesAsRead("user2", "user1")

      // Get messages and check read status
      const messages = storageManager.getMessages("user1", "user2")
      expect(messages[0].isRead).toBe(true)
    })

    it("should mark a specific message as read", () => {
      // Add an unread message
      storageManager.addMessage({
        id: "msg1",
        senderId: "user1",
        receiverId: "user2",
        content: "Hello!",
        timestamp: new Date().toISOString(),
        isRead: false,
      })

      // Mark the message as read
      storageManager.markMessageAsRead("msg1")

      // Get messages and check read status
      const messages = storageManager.getMessages("user1", "user2")
      expect(messages[0].isRead).toBe(true)
    })

    it("should get unread message count", () => {
      // Add multiple messages with different read statuses
      storageManager.addMessage({
        id: "msg1",
        senderId: "user1",
        receiverId: "user2",
        content: "Hello 1!",
        timestamp: new Date().toISOString(),
        isRead: false,
      })

      storageManager.addMessage({
        id: "msg2",
        senderId: "user1",
        receiverId: "user2",
        content: "Hello 2!",
        timestamp: new Date().toISOString(),
        isRead: true,
      })

      storageManager.addMessage({
        id: "msg3",
        senderId: "user1",
        receiverId: "user2",
        content: "Hello 3!",
        timestamp: new Date().toISOString(),
        isRead: false,
      })

      // Get unread count
      const unreadCount = storageManager.getUnreadMessageCount("user2", "user1")
      expect(unreadCount).toBe(2)
    })
  })
})

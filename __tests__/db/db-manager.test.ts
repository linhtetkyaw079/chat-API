import { IndexedDBManager } from "@/lib/db-manager"
import { vi, describe, it, expect, beforeEach } from "vitest"

// Mock IndexedDB
const indexedDBMock = {
  open: vi.fn(),
}

const idbRequestMock = {
  onerror: null as any,
  onsuccess: null as any,
  onupgradeneeded: null as any,
  result: {
    transaction: vi.fn(),
    objectStoreNames: {
      contains: vi.fn(),
    },
    createObjectStore: vi.fn().mockReturnValue({
      createIndex: vi.fn(),
    }),
  },
}

const idbTransactionMock = {
  objectStore: vi.fn(),
}

const idbObjectStoreMock = {
  put: vi.fn(),
  add: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  index: vi.fn(),
}

const idbIndexMock = {
  openCursor: vi.fn(),
}

// Mock localStorage for current user
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
  }
})()

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

Object.defineProperty(window, "indexedDB", {
  value: indexedDBMock,
})

describe("IndexedDBManager", () => {
  let dbManager: IndexedDBManager

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()

    // Reset mock implementations
    indexedDBMock.open.mockReturnValue(idbRequestMock)
    idbRequestMock.result.transaction.mockReturnValue(idbTransactionMock)
    idbTransactionMock.objectStore.mockReturnValue(idbObjectStoreMock)
    idbObjectStoreMock.index.mockReturnValue(idbIndexMock)

    // Create a new instance for each test
    dbManager = new IndexedDBManager()

    // Simulate successful database opening
    if (idbRequestMock.onsuccess) {
      idbRequestMock.onsuccess({ target: idbRequestMock })
    }
  })

  describe("Database Initialization", () => {
    it("should open the database with correct name and version", () => {
      expect(indexedDBMock.open).toHaveBeenCalledWith("secure_chat_db", 1)
    })

    it("should create object stores if they do not exist", () => {
      // Simulate database upgrade needed
      idbRequestMock.result.objectStoreNames.contains.mockReturnValue(false)

      if (idbRequestMock.onupgradeneeded) {
        idbRequestMock.onupgradeneeded({ target: idbRequestMock })
      }

      expect(idbRequestMock.result.createObjectStore).toHaveBeenCalledWith("users", { keyPath: "username" })
      expect(idbRequestMock.result.createObjectStore).toHaveBeenCalledWith("messages", { keyPath: "id" })
    })
  })

  describe("User Management", () => {
    it("should create a user", async () => {
      // Mock successful transaction
      idbObjectStoreMock.put.mockImplementation((user) => {
        const request = { result: user, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess({ target: request })
        }, 0)
        return request
      })

      const user = await dbManager.createUser("testuser", "hashedpassword", "publickey", "privatekey")

      expect(user).toEqual(
        expect.objectContaining({
          username: "testuser",
          passwordHash: "hashedpassword",
          publicKey: "publickey",
          privateKey: "privatekey",
          isOnline: true,
        }),
      )

      expect(idbTransactionMock.objectStore).toHaveBeenCalledWith("users")
      expect(idbObjectStoreMock.put).toHaveBeenCalled()
    })

    it("should get a user by username", async () => {
      const mockUser = {
        username: "testuser",
        passwordHash: "hashedpassword",
        publicKey: "publickey",
        privateKey: "privatekey",
        isOnline: true,
        lastActive: new Date().toISOString(),
      }

      // Mock successful get operation
      idbObjectStoreMock.get.mockImplementation(() => {
        const request = { result: mockUser, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess({ target: request })
        }, 0)
        return request
      })

      const user = await dbManager.getUserByUsername("testuser")

      expect(user).toEqual(mockUser)
      expect(idbTransactionMock.objectStore).toHaveBeenCalledWith("users")
      expect(idbObjectStoreMock.get).toHaveBeenCalledWith("testuser")
    })

    it("should return null for non-existent user", async () => {
      // Mock get operation that returns null
      idbObjectStoreMock.get.mockImplementation(() => {
        const request = { result: null, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess({ target: request })
        }, 0)
        return request
      })

      const user = await dbManager.getUserByUsername("nonexistentuser")
      expect(user).toBeNull()
    })

    it("should check if a user exists", async () => {
      // Mock get operation for existing user
      idbObjectStoreMock.get.mockImplementationOnce(() => {
        const request = { result: { username: "testuser" }, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess({ target: request })
        }, 0)
        return request
      })

      // Mock get operation for non-existent user
      idbObjectStoreMock.get.mockImplementationOnce(() => {
        const request = { result: null, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess({ target: request })
        }, 0)
        return request
      })

      const exists = await dbManager.checkUserExists("testuser")
      const notExists = await dbManager.checkUserExists("nonexistentuser")

      expect(exists).toBe(true)
      expect(notExists).toBe(false)
    })

    it("should login a user with correct credentials", async () => {
      const mockUser = {
        username: "testuser",
        passwordHash: "correcthash",
        isOnline: false,
        lastActive: new Date().toISOString(),
      }

      // Mock get operation
      idbObjectStoreMock.get.mockImplementation(() => {
        const request = { result: mockUser, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess({ target: request })
        }, 0)
        return request
      })

      // Mock put operation for updating user status
      idbObjectStoreMock.put.mockImplementation(() => {
        const request = { result: null, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess({ target: request })
        }, 0)
        return request
      })

      const loginResult = await dbManager.loginUser("testuser", "correcthash")
      expect(loginResult).toBe(true)
      expect(idbObjectStoreMock.put).toHaveBeenCalled()
    })

    it("should fail login with incorrect credentials", async () => {
      const mockUser = {
        username: "testuser",
        passwordHash: "correcthash",
        isOnline: false,
        lastActive: new Date().toISOString(),
      }

      // Mock get operation
      idbObjectStoreMock.get.mockImplementation(() => {
        const request = { result: mockUser, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess({ target: request })
        }, 0)
        return request
      })

      const loginResult = await dbManager.loginUser("testuser", "wronghash")
      expect(loginResult).toBe(false)
    })
  })

  describe("Current User Management", () => {
    it("should set and get current user", async () => {
      const user = {
        username: "currentuser",
        passwordHash: "hash",
        publicKey: "pk",
        privateKey: "sk",
        isOnline: true,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      await dbManager.setCurrentUser(user)
      const currentUser = dbManager.getCurrentUser()

      expect(currentUser).toEqual(user)
      expect(localStorageMock.setItem).toHaveBeenCalledWith("current_user", JSON.stringify(user))
    })

    it("should clear current user", () => {
      dbManager.clearCurrentUser()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("current_user")
    })
  })

  describe("Message Management", () => {
    it("should add a message", async () => {
      const message = {
        id: "msg1",
        senderId: "user1",
        receiverId: "user2",
        content: "Hello!",
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      // Mock add operation
      idbObjectStoreMock.add.mockImplementation(() => {
        const request = { result: null, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess({ target: request })
        }, 0)
        return request
      })

      await dbManager.addMessage(message)

      expect(idbTransactionMock.objectStore).toHaveBeenCalledWith("messages")
      expect(idbObjectStoreMock.add).toHaveBeenCalledWith(message)
    })

    it("should mark messages as read", async () => {
      // Mock cursor for iterating through messages
      const mockCursor = {
        value: {
          id: "msg1",
          senderId: "user1",
          receiverId: "user2",
          isRead: false,
        },
        continue: vi.fn(),
        update: vi.fn(),
      }

      // Mock openCursor operation
      idbIndexMock.openCursor.mockImplementation(() => {
        const request = { result: mockCursor, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess({ target: request })
          // Simulate end of cursor after first call
          setTimeout(() => {
            if (request.onsuccess) request.onsuccess({ target: { ...request, result: null } })
          }, 10)
        }, 0)
        return request
      })

      await dbManager.markMessagesAsRead("user2", "user1")

      expect(idbObjectStoreMock.index).toHaveBeenCalledWith("conversation")
      expect(idbIndexMock.openCursor).toHaveBeenCalled()
      expect(mockCursor.update).toHaveBeenCalled()
    })

    it("should handle errors during database operations", async () => {
      // Mock error during get operation
      idbObjectStoreMock.get.mockImplementation(() => {
        const request = { result: null, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onerror) request.onerror(new Error("Database error"))
        }, 0)
        return request
      })

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      const user = await dbManager.getUserByUsername("testuser")
      expect(user).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe("Migration", () => {
    it("should migrate data from localStorage to IndexedDB", async () => {
      // Mock localStorage with existing data
      const mockLocalStorage = {
        chat_app_user_user1: JSON.stringify({ username: "user1", passwordHash: "hash1" }),
        chat_app_user_user2: JSON.stringify({ username: "user2", passwordHash: "hash2" }),
        chat_app_messages: JSON.stringify([{ id: "msg1", senderId: "user1", receiverId: "user2", content: "Hello" }]),
        length: 3,
        key: (index: number) => {
          const keys = ["chat_app_user_user1", "chat_app_user_user2", "chat_app_messages"]
          return keys[index] || null
        },
        getItem: (key: string) => {
          if (key === "chat_app_user_user1") return JSON.stringify({ username: "user1", passwordHash: "hash1" })
          if (key === "chat_app_user_user2") return JSON.stringify({ username: "user2", passwordHash: "hash2" })
          if (key === "chat_app_messages")
            return JSON.stringify([{ id: "msg1", senderId: "user1", receiverId: "user2", content: "Hello" }])
          return null
        },
        setItem: vi.fn(),
      }

      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      })

      // Mock successful database operations
      idbObjectStoreMock.put.mockImplementation(() => {
        const request = { result: null, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess({ target: request })
        }, 0)
        return request
      })

      idbObjectStoreMock.add.mockImplementation(() => {
        const request = { result: null, onsuccess: null as any, onerror: null as any }
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess({ target: request })
        }, 0)
        return request
      })

      await dbManager.migrateFromLocalStorage()

      // Check if migration flag was set
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("indexeddb_migration_done", "true")
    })
  })
})

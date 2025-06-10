import type { User, Message } from "./types"

export class IndexedDBManager {
  private readonly DB_NAME = "secure_chat_db"
  private readonly DB_VERSION = 1
  private readonly USERS_STORE = "users"
  private readonly MESSAGES_STORE = "messages"
  private readonly CURRENT_USER_KEY = "current_user"
  private db: IDBDatabase | null = null

  constructor() {
    this.initDatabase()
  }

  /**
   * Initialize the database
   */
  private async initDatabase(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onerror = (event) => {
        console.error("IndexedDB error:", event)
        reject("Error opening database")
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create users store with username as key
        if (!db.objectStoreNames.contains(this.USERS_STORE)) {
          const usersStore = db.createObjectStore(this.USERS_STORE, { keyPath: "username" })
          usersStore.createIndex("isOnline", "isOnline", { unique: false })
          usersStore.createIndex("lastActive", "lastActive", { unique: false })
        }

        // Create messages store with id as key
        if (!db.objectStoreNames.contains(this.MESSAGES_STORE)) {
          const messagesStore = db.createObjectStore(this.MESSAGES_STORE, { keyPath: "id" })
          messagesStore.createIndex("senderId", "senderId", { unique: false })
          messagesStore.createIndex("receiverId", "receiverId", { unique: false })
          messagesStore.createIndex("timestamp", "timestamp", { unique: false })
          messagesStore.createIndex("conversation", ["senderId", "receiverId"], { unique: false })
        }
      }
    })
  }

  /**
   * Get a reference to the database
   */
  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db
    return this.initDatabase()
  }

  /**
   * Perform a transaction on the database
   */
  private async transaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode)
      const store = transaction.objectStore(storeName)
      const request = callback(store)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // User Management

  /**
   * Create a new user
   */
  async createUser(username: string, passwordHash: string, publicKey: string, privateKey: string): Promise<User> {
    const user: User = {
      username,
      passwordHash,
      publicKey,
      privateKey,
      isOnline: true,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    await this.transaction(this.USERS_STORE, "readwrite", (store) => store.put(user))
    await this.setCurrentUser(user)
    return user
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      return await this.transaction(this.USERS_STORE, "readonly", (store) => store.get(username))
    } catch (error) {
      console.error("Error getting user:", error)
      return null
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.USERS_STORE, "readonly")
      const store = transaction.objectStore(this.USERS_STORE)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Check if a user exists
   */
  async checkUserExists(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username)
    return user !== null
  }

  /**
   * Login a user
   */
  async loginUser(username: string, passwordHash: string): Promise<boolean> {
    const user = await this.getUserByUsername(username)

    if (user && user.passwordHash === passwordHash) {
      user.isOnline = true
      user.lastActive = new Date().toISOString()
      await this.transaction(this.USERS_STORE, "readwrite", (store) => store.put(user))
      await this.setCurrentUser(user)
      return true
    }

    return false
  }

  /**
   * Update a user's online status
   */
  async updateUserStatus(username: string, isOnline: boolean): Promise<void> {
    const user = await this.getUserByUsername(username)
    if (user) {
      user.isOnline = isOnline
      user.lastActive = new Date().toISOString()
      await this.transaction(this.USERS_STORE, "readwrite", (store) => store.put(user))
    }
  }

  /**
   * Update a user's last active timestamp
   */
  async updateLastActive(username: string): Promise<void> {
    const user = await this.getUserByUsername(username)
    if (user) {
      user.lastActive = new Date().toISOString()
      await this.transaction(this.USERS_STORE, "readwrite", (store) => store.put(user))
    }
  }

  // Current User Management

  /**
   * Set the current user
   */
  async setCurrentUser(user: User): Promise<void> {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
  }

  /**
   * Get the current user
   */
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY)
    return userData ? JSON.parse(userData) : null
  }

  /**
   * Clear the current user
   */
  clearCurrentUser(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY)
  }

  // Message Management

  /**
   * Add a new message
   */
  async addMessage(message: Message): Promise<void> {
    await this.transaction(this.MESSAGES_STORE, "readwrite", (store) => store.add(message))
  }

  /**
   * Get messages between two users
   */
  async getMessages(user1: string, user2: string): Promise<Message[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.MESSAGES_STORE, "readonly")
      const store = transaction.objectStore(this.MESSAGES_STORE)
      const messages: Message[] = []

      // We need to check both directions of conversation
      const index = store.index("conversation")
      const request1 = index.openCursor(IDBKeyRange.only([user1, user2]))
      const request2 = index.openCursor(IDBKeyRange.only([user2, user1]))

      const allMessages: Message[] = []

      // First query: user1 to user2
      request1.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          allMessages.push(cursor.value)
          cursor.continue()
        } else {
          // When first query is done, start second query
          request2.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
            if (cursor) {
              allMessages.push(cursor.value)
              cursor.continue()
            } else {
              // Both queries are done, sort and return messages
              resolve(allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
            }
          }
        }
      }

      request1.onerror = () => reject(request1.error)
      request2.onerror = () => reject(request2.error)
    })
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(currentUser: string, fromUser: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.MESSAGES_STORE, "readwrite")
      const store = transaction.objectStore(this.MESSAGES_STORE)
      const index = store.index("conversation")
      const request = index.openCursor(IDBKeyRange.only([fromUser, currentUser]))

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          const message = cursor.value
          if (!message.isRead) {
            message.isRead = true
            cursor.update(message)
          }
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Mark a specific message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.MESSAGES_STORE, "readwrite")
      const store = transaction.objectStore(this.MESSAGES_STORE)
      const request = store.get(messageId)

      request.onsuccess = () => {
        const message = request.result
        if (message) {
          message.isRead = true
          store.put(message)
          resolve()
        } else {
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get the count of unread messages from a specific user
   */
  async getUnreadMessageCount(currentUser: string, fromUser: string): Promise<number> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.MESSAGES_STORE, "readonly")
      const store = transaction.objectStore(this.MESSAGES_STORE)
      const index = store.index("conversation")
      const request = index.openCursor(IDBKeyRange.only([fromUser, currentUser]))

      let count = 0

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          const message = cursor.value
          if (!message.isRead) {
            count++
          }
          cursor.continue()
        } else {
          resolve(count)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Migrate data from localStorage to IndexedDB
   */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      // Check if migration has already been done
      const migrationDone = localStorage.getItem("indexeddb_migration_done")
      if (migrationDone === "true") {
        return
      }

      console.log("Starting migration from localStorage to IndexedDB...")

      // Migrate users
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith("chat_app_user_")) {
          const userData = localStorage.getItem(key)
          if (userData) {
            const user = JSON.parse(userData)
            await this.transaction(this.USERS_STORE, "readwrite", (store) => store.put(user))
          }
        }
      }

      // Migrate messages
      const messagesJson = localStorage.getItem("chat_app_messages")
      if (messagesJson) {
        const messages: Message[] = JSON.parse(messagesJson)
        const db = await this.getDB()
        const transaction = db.transaction(this.MESSAGES_STORE, "readwrite")
        const store = transaction.objectStore(this.MESSAGES_STORE)

        for (const message of messages) {
          store.add(message)
        }
      }

      // Mark migration as done
      localStorage.setItem("indexeddb_migration_done", "true")
      console.log("Migration from localStorage to IndexedDB completed successfully")
    } catch (error) {
      console.error("Error during migration:", error)
    }
  }
}

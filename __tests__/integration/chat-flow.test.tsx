import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ChatApplication from "@/components/chat-application"
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"

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

// Mock IndexedDB
const indexedDBMock = {
  open: vi.fn(),
}

Object.defineProperty(window, "indexedDB", {
  value: indexedDBMock,
})

// Mock fetch
global.fetch = vi.fn()

describe("Chat Application Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it("should show login screen when not authenticated", async () => {
    // Mock localStorage to return no current user
    localStorageMock.getItem.mockReturnValue(null)

    render(<ChatApplication />)

    // Wait for the application to load
    await waitFor(() => {
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
    })
  })

  it("should authenticate a user and show chat interface", async () => {
    // Mock localStorage to return no current user initially
    localStorageMock.getItem.mockReturnValue(null)

    // Mock successful login
    global.fetch = vi.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: "123", username: "testuser" },
          }),
      }),
    )

    render(<ChatApplication />)

    // Wait for login screen to appear
    await waitFor(() => {
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
    })

    // Fill in login form
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "testuser" },
    })
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    })

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

    // Wait for chat interface to appear
    await waitFor(() => {
      expect(screen.getByText(/messages/i)).toBeInTheDocument()
    })
  })

  it("should send and receive messages", async () => {
    // Mock authenticated user
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "chat_app_current_user") {
        return JSON.stringify({ id: "123", username: "testuser" })
      }
      return null
    })

    render(<ChatApplication />)

    // Wait for chat interface to appear
    await waitFor(() => {
      expect(screen.getByText(/messages/i)).toBeInTheDocument()
    })

    // Select a user to chat with
    const userElement = await screen.findByText("user1")
    fireEvent.click(userElement)

    // Type a message
    const messageInput = screen.getByPlaceholderText(/type a message/i)
    fireEvent.change(messageInput, { target: { value: "Hello, user1!" } })

    // Send the message
    const sendButton = screen.getByRole("button", { name: /send message/i })
    fireEvent.click(sendButton)

    // Verify message was sent and appears in the chat
    await waitFor(() => {
      expect(screen.getByText("Hello, user1!")).toBeInTheDocument()
    })

    // Wait for automated response (simulated in the component)
    await waitFor(
      () => {
        expect(screen.getByText(/this is an automated response/i)).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it("should logout a user", async () => {
    // Mock authenticated user
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "chat_app_current_user") {
        return JSON.stringify({ id: "123", username: "testuser" })
      }
      return null
    })

    // Mock successful logout
    global.fetch = vi.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    )

    render(<ChatApplication />)

    // Wait for chat interface to appear
    await waitFor(() => {
      expect(screen.getByText(/messages/i)).toBeInTheDocument()
    })

    // Click logout button
    const logoutButton = screen.getByRole("button", { name: /logout/i })
    fireEvent.click(logoutButton)

    // Verify user is logged out and login screen appears
    await waitFor(() => {
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
    })
  })

  it("should register a new user", async () => {
    // Mock localStorage to return no current user
    localStorageMock.getItem.mockReturnValue(null)

    // Mock successful registration
    global.fetch = vi.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: "456", username: "newuser" },
          }),
      }),
    )

    render(<ChatApplication />)

    // Wait for login screen to appear
    await waitFor(() => {
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
    })

    // Switch to registration form
    fireEvent.click(screen.getByText(/sign up/i))

    // Fill in registration form
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "newuser" },
    })
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    })
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: "password123" },
    })

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /create account/i }))

    // Wait for chat interface to appear
    await waitFor(() => {
      expect(screen.getByText(/messages/i)).toBeInTheDocument()
    })
  })
})

import { render, screen } from "@testing-library/react"
import ChatWindow from "@/components/chat-window"
import { vi, describe, it, expect, beforeEach } from "vitest"

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

describe("ChatWindow", () => {
  const mockCurrentUser = {
    username: "currentuser",
    id: "user1",
    isOnline: true,
    lastActive: new Date().toISOString(),
  }

  const mockSelectedUser = {
    username: "testuser",
    id: "user2",
    isOnline: true,
    lastActive: new Date().toISOString(),
  }

  const mockMessages = [
    {
      id: "msg1",
      senderId: "testuser",
      receiverId: "currentuser",
      content: "Hello there!",
      timestamp: new Date().toISOString(),
      isRead: true,
      isEncrypted: false,
    },
    {
      id: "msg2",
      senderId: "currentuser",
      receiverId: "testuser",
      content: "Hi! How are you?",
      originalContent: "Hi! How are you?",
      timestamp: new Date().toISOString(),
      isRead: false,
      isEncrypted: true,
    },
    {
      id: "msg3",
      senderId: "testuser",
      receiverId: "currentuser",
      content: "encrypted_content",
      timestamp: new Date().toISOString(),
      isRead: false,
      isEncrypted: true,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render chat window with messages", () => {
    render(<ChatWindow messages={mockMessages} currentUser={mockCurrentUser} selectedUser={mockSelectedUser} />)

    // Check if messages are rendered
    expect(screen.getByText("Hello there!")).toBeInTheDocument()
    expect(screen.getByText("Hi! How are you?")).toBeInTheDocument()
    expect(screen.getByText("(Encrypted message)")).toBeInTheDocument()
  })

  it('should display "No messages yet" when there are no messages', () => {
    render(<ChatWindow messages={[]} currentUser={mockCurrentUser} selectedUser={mockSelectedUser} />)

    expect(screen.getByText("No messages yet")).toBeInTheDocument()
    expect(screen.getByText("Send a message to start the conversation")).toBeInTheDocument()
  })

  it("should group messages by date", () => {
    // Create messages with different dates
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const messagesWithDifferentDates = [
      {
        id: "msg1",
        senderId: "testuser",
        receiverId: "currentuser",
        content: "Message from today",
        timestamp: new Date().toISOString(),
        isRead: true,
        isEncrypted: false,
      },
      {
        id: "msg2",
        senderId: "currentuser",
        receiverId: "testuser",
        content: "Message from yesterday",
        timestamp: yesterday.toISOString(),
        isRead: false,
        isEncrypted: false,
      },
      {
        id: "msg3",
        senderId: "testuser",
        receiverId: "currentuser",
        content: "Message from two days ago",
        timestamp: twoDaysAgo.toISOString(),
        isRead: false,
        isEncrypted: false,
      },
    ]

    render(
      <ChatWindow
        messages={messagesWithDifferentDates}
        currentUser={mockCurrentUser}
        selectedUser={mockSelectedUser}
      />,
    )

    // Check if date separators are rendered
    expect(screen.getByText("Today")).toBeInTheDocument()
    expect(screen.getByText(yesterday.toLocaleDateString())).toBeInTheDocument()
    expect(screen.getByText(twoDaysAgo.toLocaleDateString())).toBeInTheDocument()

    // Check if messages are rendered under their respective dates
    expect(screen.getByText("Message from today")).toBeInTheDocument()
    expect(screen.getByText("Message from yesterday")).toBeInTheDocument()
    expect(screen.getByText("Message from two days ago")).toBeInTheDocument()
  })

  it("should display read status indicators for sent messages", () => {
    const messagesWithReadStatus = [
      {
        id: "msg1",
        senderId: "currentuser",
        receiverId: "testuser",
        content: "Read message",
        timestamp: new Date().toISOString(),
        isRead: true,
        isEncrypted: false,
      },
      {
        id: "msg2",
        senderId: "currentuser",
        receiverId: "testuser",
        content: "Unread message",
        timestamp: new Date().toISOString(),
        isRead: false,
        isEncrypted: false,
      },
    ]

    render(
      <ChatWindow messages={messagesWithReadStatus} currentUser={mockCurrentUser} selectedUser={mockSelectedUser} />,
    )

    // Check if read status indicators are rendered
    const checkIcons = screen.getAllByTestId("check-icon")
    const doubleCheckIcons = screen.getAllByTestId("double-check-icon")

    expect(checkIcons.length).toBe(1) // One unread message
    expect(doubleCheckIcons.length).toBe(1) // One read message
  })

  it("should handle encrypted messages correctly", () => {
    const encryptedMessages = [
      {
        id: "msg1",
        senderId: "currentuser",
        receiverId: "testuser",
        content: "encrypted_content",
        originalContent: "Decrypted content for sender",
        timestamp: new Date().toISOString(),
        isRead: true,
        isEncrypted: true,
      },
      {
        id: "msg2",
        senderId: "testuser",
        receiverId: "currentuser",
        content: "encrypted_content",
        timestamp: new Date().toISOString(),
        isRead: false,
        isEncrypted: true,
      },
    ]

    render(<ChatWindow messages={encryptedMessages} currentUser={mockCurrentUser} selectedUser={mockSelectedUser} />)

    // Sender should see decrypted content for their own messages
    expect(screen.getByText("Decrypted content for sender")).toBeInTheDocument()

    // Receiver should see placeholder for encrypted messages
    expect(screen.getByText("(Encrypted message)")).toBeInTheDocument()
  })

  it("should scroll to bottom when messages change", () => {
    render(<ChatWindow messages={mockMessages} currentUser={mockCurrentUser} selectedUser={mockSelectedUser} />)

    // Check if scrollIntoView was called
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" })
  })
})

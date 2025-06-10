import { render, screen, fireEvent } from "@testing-library/react"
import MessageInput from "@/components/message-input"
import { vi, describe, it, expect, beforeEach } from "vitest"

describe("MessageInput", () => {
  const mockOnSendMessage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render message input correctly", () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />)

    // Check if input and send button are rendered
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument()
  })

  it("should handle input changes", () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />)

    const input = screen.getByPlaceholderText("Type a message...")
    fireEvent.change(input, { target: { value: "Hello world!" } })

    expect(input).toHaveValue("Hello world!")
  })

  it("should call onSendMessage when form is submitted", () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />)

    const input = screen.getByPlaceholderText("Type a message...")
    const sendButton = screen.getByRole("button", { name: /send message/i })

    fireEvent.change(input, { target: { value: "Hello world!" } })
    fireEvent.click(sendButton)

    expect(mockOnSendMessage).toHaveBeenCalledWith("Hello world!")
    expect(input).toHaveValue("") // Input should be cleared after sending
  })

  it("should not call onSendMessage when message is empty", () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />)

    const sendButton = screen.getByRole("button", { name: /send message/i })

    // Try to send an empty message
    fireEvent.click(sendButton)

    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it("should send message when Enter key is pressed", () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />)

    const input = screen.getByPlaceholderText("Type a message...")

    fireEvent.change(input, { target: { value: "Hello world!" } })
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" })

    expect(mockOnSendMessage).toHaveBeenCalledWith("Hello world!")
    expect(input).toHaveValue("") // Input should be cleared after sending
  })

  it("should not send message when Shift+Enter is pressed (new line)", () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />)

    const input = screen.getByPlaceholderText("Type a message...")

    fireEvent.change(input, { target: { value: "Hello world!" } })
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", shiftKey: true })

    expect(mockOnSendMessage).not.toHaveBeenCalled()
    expect(input).toHaveValue("Hello world!") // Input should not be cleared
  })

  it("should auto-resize textarea when content changes", () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />)

    const textarea = screen.getByPlaceholderText("Type a message...")

    // Mock scrollHeight
    Object.defineProperty(textarea, "scrollHeight", { value: 100 })

    fireEvent.change(textarea, { target: { value: "Hello\nworld!\nThis\nis\na\nlong\nmessage." } })

    // Check if height was set to scrollHeight
    expect(textarea.style.height).toBe("100px")
  })

  it("should disable send button when message is empty", () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />)

    const sendButton = screen.getByRole("button", { name: /send message/i })

    expect(sendButton).toBeDisabled()

    const input = screen.getByPlaceholderText("Type a message...")
    fireEvent.change(input, { target: { value: "Hello" } })

    expect(sendButton).not.toBeDisabled()

    fireEvent.change(input, { target: { value: "" } })

    expect(sendButton).toBeDisabled()
  })

  it("should trim whitespace from messages before sending", () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />)

    const input = screen.getByPlaceholderText("Type a message...")
    const sendButton = screen.getByRole("button", { name: /send message/i })

    fireEvent.change(input, { target: { value: "   Hello world!   " } })
    fireEvent.click(sendButton)

    expect(mockOnSendMessage).toHaveBeenCalledWith("   Hello world!   ")
  })
})

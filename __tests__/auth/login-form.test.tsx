"use client"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import LoginForm from "@/components/login-form"
import { vi, describe, it, expect, beforeEach } from "vitest"

describe("LoginForm", () => {
  const mockOnSubmit = vi.fn()
  const mockOnToggle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render login form correctly", () => {
    render(<LoginForm onSubmit={mockOnSubmit} onToggle={mockOnToggle} />)

    // Check if form elements are rendered
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument()
  })

  it("should handle input changes", () => {
    render(<LoginForm onSubmit={mockOnSubmit} onToggle={mockOnToggle} />)

    const usernameInput = screen.getByPlaceholderText("Username")
    const passwordInput = screen.getByPlaceholderText("Password")

    fireEvent.change(usernameInput, { target: { value: "testuser" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    expect(usernameInput).toHaveValue("testuser")
    expect(passwordInput).toHaveValue("password123")
  })

  it("should call onSubmit with username and password when form is submitted", async () => {
    render(<LoginForm onSubmit={mockOnSubmit} onToggle={mockOnToggle} />)

    const usernameInput = screen.getByPlaceholderText("Username")
    const passwordInput = screen.getByPlaceholderText("Password")
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(usernameInput, { target: { value: "testuser" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalledWith("testuser", "password123")
  })

  it("should call onToggle when sign up button is clicked", () => {
    render(<LoginForm onSubmit={mockOnSubmit} onToggle={mockOnToggle} />)

    const toggleButton = screen.getByRole("button", { name: /sign up/i })
    fireEvent.click(toggleButton)

    expect(mockOnToggle).toHaveBeenCalled()
  })

  it("should display error message when login fails", async () => {
    // Mock onSubmit to throw an error
    const mockOnSubmitWithError = vi.fn().mockRejectedValue(new Error("Login failed"))

    render(<LoginForm onSubmit={mockOnSubmitWithError} onToggle={mockOnToggle} />)

    const usernameInput = screen.getByPlaceholderText("Username")
    const passwordInput = screen.getByPlaceholderText("Password")
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(usernameInput, { target: { value: "testuser" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText("Invalid username or password")).toBeInTheDocument()
    })
  })

  it("should disable submit button while loading", async () => {
    // Mock onSubmit to return a promise that doesn't resolve immediately
    const mockOnSubmitLoading = vi.fn().mockImplementation(() => new Promise(() => {}))

    render(<LoginForm onSubmit={mockOnSubmitLoading} onToggle={mockOnToggle} />)

    const usernameInput = screen.getByPlaceholderText("Username")
    const passwordInput = screen.getByPlaceholderText("Password")
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(usernameInput, { target: { value: "testuser" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    // Check if button is disabled and shows loading state
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(screen.getByText("Signing in...")).toBeInTheDocument()
    })
  })

  it("should validate required fields", async () => {
    render(<LoginForm onSubmit={mockOnSubmit} onToggle={mockOnToggle} />)

    const submitButton = screen.getByRole("button", { name: /sign in/i })
    fireEvent.click(submitButton)

    // Form should not submit if fields are empty
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
})

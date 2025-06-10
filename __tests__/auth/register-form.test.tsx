"use client"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import RegisterForm from "@/components/register-form"
import { vi, describe, it, expect, beforeEach } from "vitest"

describe("RegisterForm", () => {
  const mockOnSubmit = vi.fn()
  const mockOnToggle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render register form correctly", () => {
    render(<RegisterForm onSubmit={mockOnSubmit} onToggle={mockOnToggle} />)

    // Check if form elements are rendered
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("should handle input changes", () => {
    render(<RegisterForm onSubmit={mockOnSubmit} onToggle={mockOnToggle} />)

    const usernameInput = screen.getByPlaceholderText("Username")
    const passwordInput = screen.getByPlaceholderText("Password")
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password")

    fireEvent.change(usernameInput, { target: { value: "newuser" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } })

    expect(usernameInput).toHaveValue("newuser")
    expect(passwordInput).toHaveValue("password123")
    expect(confirmPasswordInput).toHaveValue("password123")
  })

  it("should validate password match", async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} onToggle={mockOnToggle} />)

    const usernameInput = screen.getByPlaceholderText("Username")
    const passwordInput = screen.getByPlaceholderText("Password")
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password")
    const submitButton = screen.getByRole("button", { name: /create account/i })

    fireEvent.change(usernameInput, { target: { value: "newuser" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.change(confirmPasswordInput, { target: { value: "password456" } }) // Different password
    fireEvent.click(submitButton)

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
    })

    // Form should not submit if passwords don't match
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it("should call onSubmit with username and password when form is submitted with matching passwords", async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} onToggle={mockOnToggle} />)

    const usernameInput = screen.getByPlaceholderText("Username")
    const passwordInput = screen.getByPlaceholderText("Password")
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password")
    const submitButton = screen.getByRole("button", { name: /create account/i })

    fireEvent.change(usernameInput, { target: { value: "newuser" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalledWith("newuser", "password123")
  })

  it("should call onToggle when sign in button is clicked", () => {
    render(<RegisterForm onSubmit={mockOnSubmit} onToggle={mockOnToggle} />)

    const toggleButton = screen.getByRole("button", { name: /sign in/i })
    fireEvent.click(toggleButton)

    expect(mockOnToggle).toHaveBeenCalled()
  })

  it("should display error message when registration fails", async () => {
    // Mock onSubmit to throw an error
    const mockOnSubmitWithError = vi.fn().mockRejectedValue(new Error("Registration failed"))

    render(<RegisterForm onSubmit={mockOnSubmitWithError} onToggle={mockOnToggle} />)

    const usernameInput = screen.getByPlaceholderText("Username")
    const passwordInput = screen.getByPlaceholderText("Password")
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password")
    const submitButton = screen.getByRole("button", { name: /create account/i })

    fireEvent.change(usernameInput, { target: { value: "newuser" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument()
    })
  })

  it("should disable submit button while loading", async () => {
    // Mock onSubmit to return a promise that doesn't resolve immediately
    const mockOnSubmitLoading = vi.fn().mockImplementation(() => new Promise(() => {}))

    render(<RegisterForm onSubmit={mockOnSubmitLoading} onToggle={mockOnToggle} />)

    const usernameInput = screen.getByPlaceholderText("Username")
    const passwordInput = screen.getByPlaceholderText("Password")
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password")
    const submitButton = screen.getByRole("button", { name: /create account/i })

    fireEvent.change(usernameInput, { target: { value: "newuser" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    // Check if button is disabled and shows loading state
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(screen.getByText("Creating Account...")).toBeInTheDocument()
    })
  })

  it("should validate required fields", async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} onToggle={mockOnToggle} />)

    const submitButton = screen.getByRole("button", { name: /create account/i })
    fireEvent.click(submitButton)

    // Form should not submit if fields are empty
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
})

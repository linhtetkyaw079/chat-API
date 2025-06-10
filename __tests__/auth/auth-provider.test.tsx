"use client"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { act } from "react-dom/test-utils"
import AuthProvider, { useAuth } from "@/components/auth-provider"
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"

// Mock fetch
global.fetch = vi.fn()

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
  }
})()

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

// Test component to access auth context
function TestComponent() {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="user-status">{auth.user ? "logged-in" : "logged-out"}</div>
      <button onClick={() => auth.login("testuser", "password123")}>Login</button>
      <button onClick={() => auth.register("newuser", "password123")}>Register</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  )
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it("should initialize with no user", () => {
    // Mock fetch to return no user
    global.fetch = vi.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      }),
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByTestId("user-status")).toHaveTextContent("logged-out")
  })

  it("should login a user successfully", async () => {
    // Mock successful login response
    global.fetch = vi.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: "123", username: "testuser" },
          }),
      }),
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Click login button
    fireEvent.click(screen.getByText("Login"))

    // Wait for the login process to complete
    await waitFor(() => {
      expect(screen.getByTestId("user-status")).toHaveTextContent("logged-in")
    })

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "testuser", password: "password123" }),
      credentials: "include",
    })
  })

  it("should handle login failure", async () => {
    // Mock failed login response
    global.fetch = vi.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid credentials" }),
      }),
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Click login button
    fireEvent.click(screen.getByText("Login"))

    // Wait for the login process to complete
    await waitFor(() => {
      expect(screen.getByTestId("user-status")).toHaveTextContent("logged-out")
    })
  })

  it("should register a new user successfully", async () => {
    // Mock key pair generation
    const mockKeyPair = {
      publicKey: "mock-public-key",
      privateKey: "mock-private-key",
    }

    // Mock successful registration response
    global.fetch = vi.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: "456", username: "newuser" },
          }),
      }),
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Mock the generateKeyPair function
    const authInstance = useAuth()
    const originalGenerateKeyPair = authInstance.generateKeyPair
    authInstance.generateKeyPair = vi.fn().mockResolvedValue(mockKeyPair)

    // Click register button
    fireEvent.click(screen.getByText("Register"))

    // Wait for the registration process to complete
    await waitFor(() => {
      expect(screen.getByTestId("user-status")).toHaveTextContent("logged-in")
    })

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: expect.stringContaining("newuser"),
      credentials: "include",
    })

    // Restore original function
    authInstance.generateKeyPair = originalGenerateKeyPair
  })

  it("should logout a user successfully", async () => {
    // Mock successful logout response
    global.fetch = vi.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    )

    // Set initial state as logged in
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Mock the auth context to have a user
    act(() => {
      const authContext = useAuth()
      authContext.login("testuser", "password123")
    })

    // Click logout button
    fireEvent.click(screen.getByText("Logout"))

    // Wait for the logout process to complete
    await waitFor(() => {
      expect(screen.getByTestId("user-status")).toHaveTextContent("logged-out")
    })

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
  })

  it("should check authentication status on mount", async () => {
    // Mock successful auth check response
    global.fetch = vi.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: "123", username: "testuser" },
          }),
      }),
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Wait for the auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId("user-status")).toHaveTextContent("logged-in")
    })

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/check", {
      credentials: "include",
    })
  })

  it("should handle network errors during authentication", async () => {
    // Mock network error
    global.fetch = vi.fn().mockImplementationOnce(() => Promise.reject(new Error("Network error")))

    // Spy on console.error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Wait for the auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId("user-status")).toHaveTextContent("logged-out")
    })

    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

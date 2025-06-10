import { render, screen, fireEvent } from "@testing-library/react"
import UserList from "@/components/user-list"
import { vi, describe, it, expect } from "vitest"

describe("UserList", () => {
  const mockUsers = [
    {
      username: "user1",
      isOnline: true,
      lastActive: new Date().toISOString(),
    },
    {
      username: "user2",
      isOnline: false,
      lastActive: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
      username: "user3",
      isOnline: true,
      lastActive: new Date().toISOString(),
    },
  ]

  const mockUnreadCounts = {
    user1: 2,
    user2: 0,
    user3: 5,
  }

  const mockOnSelectUser = vi.fn()

  it("should render user list correctly", () => {
    render(
      <UserList
        users={mockUsers}
        selectedUser={null}
        onSelectUser={mockOnSelectUser}
        unreadCounts={mockUnreadCounts}
      />,
    )

    // Check if all users are rendered
    expect(screen.getByText("user1")).toBeInTheDocument()
    expect(screen.getByText("user2")).toBeInTheDocument()
    expect(screen.getByText("user3")).toBeInTheDocument()
  })

  it("should display online status indicators correctly", () => {
    render(
      <UserList
        users={mockUsers}
        selectedUser={null}
        onSelectUser={mockOnSelectUser}
        unreadCounts={mockUnreadCounts}
      />,
    )

    // Check online status text
    expect(screen.getAllByText("Online").length).toBe(2) // Two users are online

    // Check for "Last seen" text for offline user
    const lastSeenText = screen.getByText((content) => content.startsWith("Last seen"))
    expect(lastSeenText).toBeInTheDocument()
  })

  it("should display unread message counts correctly", () => {
    render(
      <UserList
        users={mockUsers}
        selectedUser={null}
        onSelectUser={mockOnSelectUser}
        unreadCounts={mockUnreadCounts}
      />,
    )

    // Check unread badges
    expect(screen.getByText("2")).toBeInTheDocument() // user1 has 2 unread messages
    expect(screen.getByText("5")).toBeInTheDocument() // user3 has 5 unread messages

    // user2 has 0 unread messages, so no badge should be displayed
    const user2Element = screen.getByText("user2").closest("button")
    const badgeInUser2 = user2Element?.querySelector(".badge")
    expect(badgeInUser2).toBeNull()
  })

  it("should call onSelectUser when a user is clicked", () => {
    render(
      <UserList
        users={mockUsers}
        selectedUser={null}
        onSelectUser={mockOnSelectUser}
        unreadCounts={mockUnreadCounts}
      />,
    )

    // Click on a user
    fireEvent.click(screen.getByText("user1"))

    expect(mockOnSelectUser).toHaveBeenCalledWith(mockUsers[0])
  })

  it("should highlight the selected user", () => {
    render(
      <UserList
        users={mockUsers}
        selectedUser={mockUsers[1]} // user2 is selected
        onSelectUser={mockOnSelectUser}
        unreadCounts={mockUnreadCounts}
      />,
    )

    // Check if user2's button has the selected class
    const user2Button = screen.getByText("user2").closest("button")
    expect(user2Button).toHaveClass("bg-emerald-100")
  })

  it("should display a message when no users are found", () => {
    render(<UserList users={[]} selectedUser={null} onSelectUser={mockOnSelectUser} unreadCounts={{}} />)

    expect(screen.getByText("No other users found")).toBeInTheDocument()
    expect(screen.getByText(/since this is a local demo/i)).toBeInTheDocument()
  })

  it("should format last active time correctly", () => {
    // Create a user who was last active 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 7200000)
    const userWithOlderLastActive = [
      {
        username: "olderUser",
        isOnline: false,
        lastActive: twoHoursAgo.toISOString(),
      },
    ]

    render(
      <UserList
        users={userWithOlderLastActive}
        selectedUser={null}
        onSelectUser={mockOnSelectUser}
        unreadCounts={{}}
      />,
    )

    // Check if the last active time is formatted correctly
    expect(screen.getByText(/last seen/i)).toBeInTheDocument()
  })
})

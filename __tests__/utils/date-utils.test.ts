import { formatDistanceToNow } from "@/lib/date-utils"
import { describe, it, expect, beforeEach, afterEach } from "vitest"

describe("Date Utilities", () => {
  // Mock Date.now
  let originalDate: DateConstructor

  beforeEach(() => {
    originalDate = global.Date
    // Set current time to 2023-01-01T12:00:00Z
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
  })

  afterEach(() => {
    global.Date = originalDate
  })

  it('should return "just now" for times less than a minute ago', () => {
    const date = new Date(Date.now() - 30 * 1000) // 30 seconds ago
    expect(formatDistanceToNow(date)).toBe("just now")
  })

  it("should return minutes for times less than an hour ago", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    expect(formatDistanceToNow(date)).toBe("5m ago")
  })

  it("should return hours for times less than a day ago", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    expect(formatDistanceToNow(date)).toBe("3h ago")
  })

  it('should return "yesterday" for 1 day ago', () => {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    expect(formatDistanceToNow(date)).toBe("yesterday")
  })

  it("should return days for times less than a week ago", () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    expect(formatDistanceToNow(date)).toBe("3d ago")
  })

  it("should return time for times more than a week ago", () => {
    const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago

    // The expected format depends on the locale, but we can check if it contains numbers and colons
    const result = formatDistanceToNow(date)
    expect(result).toMatch(/\d+:\d+/)
  })

  it("should handle future dates", () => {
    const date = new Date(Date.now() + 60 * 60 * 1000) // 1 hour in the future

    // Future dates should still be formatted as time
    const result = formatDistanceToNow(date)
    expect(result).toMatch(/\d+:\d+/)
  })
})

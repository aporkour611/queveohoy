import { describe, expect, it, vi } from "vitest"
import { healthIsReady } from "./health-checks"

describe("health-checks", () => {
  it("requires database and feed when supabase configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_test")
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test")

    expect(
      healthIsReady({
        database: true,
        feed: true,
        feedEventCount: 10,
        feedError: null,
      })
    ).toBe(true)
  })

  it("fails when feed is empty with supabase configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_test")

    expect(
      healthIsReady({
        database: true,
        feed: false,
        feedEventCount: 0,
        feedError: null,
      })
    ).toBe(false)
  })
})

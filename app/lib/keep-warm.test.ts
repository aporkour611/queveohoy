import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import {
  keepWarmIsHealthy,
  warmOriginPath,
  KEEP_WARM_ORIGIN_PATHS,
} from "./keep-warm"

describe("keepWarmIsHealthy", () => {
  it("requires database and non-empty feeds", () => {
    expect(
      keepWarmIsHealthy({
        database: true,
        home: { count: 10, error: null },
        destacados: { count: 5, error: null },
        feed: { count: 100, error: null },
        week: { count: 50, error: null },
        ms: 1,
      })
    ).toBe(true)

    expect(
      keepWarmIsHealthy({
        database: false,
        home: { count: 10, error: null },
        destacados: { count: 5, error: null },
        feed: { count: 100, error: null },
        week: { count: 50, error: null },
        ms: 1,
      })
    ).toBe(false)
  })
})

describe("warmOriginPath", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn(async () => new Response("ok", { status: 200 })) as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it("hits absolute URL for path", async () => {
    const result = await warmOriginPath("/api/health", "https://queveohoy.es")
    expect(result.ok).toBe(true)
    expect(result.path).toBe("/api/health")
    expect(global.fetch).toHaveBeenCalledWith(
      "https://queveohoy.es/api/health",
      expect.objectContaining({ cache: "no-store" })
    )
  })

  it("exports all origin paths including home", () => {
    expect(KEEP_WARM_ORIGIN_PATHS).toContain("/")
    expect(KEEP_WARM_ORIGIN_PATHS).toContain("/api/feed-meta")
    expect(KEEP_WARM_ORIGIN_PATHS).toContain("/futbol")
    expect(KEEP_WARM_ORIGIN_PATHS).toContain("/champions")
    expect(KEEP_WARM_ORIGIN_PATHS).toContain("/laliga")
    expect(KEEP_WARM_ORIGIN_PATHS).toContain("/api/v1/feed/week")
  })
})

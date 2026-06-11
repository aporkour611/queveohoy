import { afterEach, describe, expect, it, vi } from "vitest"
import {
  prefetchHomeFeedWeekOnce,
  prefetchPublicWeekFeedOnce,
  resetWeekFeedPrefetchForTests,
} from "./perf-prefetch"

describe("perf-prefetch", () => {
  afterEach(() => {
    resetWeekFeedPrefetchForTests()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("prefetches week feed only once", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("window", {} as Window & typeof globalThis)

    prefetchHomeFeedWeekOnce()
    prefetchHomeFeedWeekOnce()
    prefetchHomeFeedWeekOnce()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("prefetches public week API", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("window", {} as Window & typeof globalThis)

    prefetchPublicWeekFeedOnce()

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/feed/week",
      expect.objectContaining({ credentials: "omit" })
    )
  })
})

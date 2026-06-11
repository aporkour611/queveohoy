import { describe, expect, it } from "vitest"
import {
  HOME_FEED_WEEK_PREFETCH_URL,
  PUBLIC_WEEK_FEED_PREFETCH_URL,
} from "./home-feed-intent"

describe("home-feed-intent URLs", () => {
  it("exposes internal and public week prefetch paths", () => {
    expect(HOME_FEED_WEEK_PREFETCH_URL).toBe("/api/events?scope=week")
    expect(PUBLIC_WEEK_FEED_PREFETCH_URL).toBe("/api/v1/feed/week")
  })
})

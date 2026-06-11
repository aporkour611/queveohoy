import { describe, expect, it } from "vitest"
import { buildFeedMetaPayload } from "./feed-meta-payload"
import type { EventRow } from "../components/types"

function row(id: number, date: string): EventRow {
  return {
    id,
    title: `Event ${id}`,
    date,
    time: "21:00",
    sport: "futbol",
    competition: null,
    platform: null,
    channels: null,
    slug: null,
  } as EventRow
}

describe("buildFeedMetaPayload", () => {
  it("computes todayCount and weekCount", () => {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Europe/Madrid",
    })

    const payload = buildFeedMetaPayload({
      events: [row(1, today), row(2, "2099-01-01")],
      weekEvents: [row(1, today), row(2, today), row(3, "2099-01-02")],
      generatedAt: "2026-06-11T10:00:00.000Z",
    })

    expect(payload.todayCount).toBe(1)
    expect(payload.weekCount).toBe(3)
    expect(payload.eventCount).toBe(2)
    expect(payload.timezone).toBe("Europe/Madrid")
    expect(payload.revalidateSeconds).toBeGreaterThan(0)
  })

  it("surfaces first feed error", () => {
    const payload = buildFeedMetaPayload({
      events: [],
      weekEvents: [],
      feedError: "db down",
      weekError: "week fail",
    })

    expect(payload.error).toBe("db down")
  })

  it("surfaces week error when feed ok", () => {
    const payload = buildFeedMetaPayload({
      events: [],
      weekEvents: [],
      weekError: "week timeout",
    })

    expect(payload.error).toBe("week timeout")
  })
})

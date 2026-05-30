import { describe, expect, it } from "vitest"
import type { EventRow } from "../components/types"
import { pickTonightEvents } from "./embed-tonight"
import {
  buildPublicApiFeedResponse,
  filterPublicApiEventsByDate,
  toPublicApiEvent,
  toPublicApiEvents,
} from "./public-api"

const sampleEvent: EventRow = {
  id: 42,
  title: "Real Madrid vs Barcelona",
  date: "2026-05-30",
  time: "21:00",
  sport: "football",
  platform: "Movistar LaLiga",
  competition: "LaLiga",
}

describe("public-api", () => {
  it("maps event rows to public shape with partido url", () => {
    const mapped = toPublicApiEvent(sampleEvent)
    expect(mapped?.id).toBe(42)
    expect(mapped?.url).toContain("/partido/2026-05-30")
    expect(mapped?.time).toBe("21:00")
  })

  it("filters events by date key", () => {
    const events: EventRow[] = [
      sampleEvent,
      { ...sampleEvent, id: 43, date: "2026-05-31" },
    ]
    const filtered = filterPublicApiEventsByDate(events, "2026-05-30")
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.id).toBe(42)
  })

  it("builds feed response envelope", () => {
    const publicEvents = toPublicApiEvents([sampleEvent])
    const body = buildPublicApiFeedResponse(
      publicEvents,
      "2026-05-30",
      "Europe/Madrid"
    )
    expect(body.version).toBe("1")
    expect(body.count).toBe(1)
    expect(body.docs).toContain("/desarrolladores")
  })
})

describe("embed-tonight", () => {
  it("keeps evening events for today sorted by time", () => {
    const events: EventRow[] = [
      { id: 1, title: "Tarde", date: "2026-05-30", time: "17:30", sport: "tv" },
      { id: 2, title: "Noche", date: "2026-05-30", time: "22:00", sport: "tv" },
      { id: 3, title: "Mañana", date: "2026-05-31", time: "21:00", sport: "tv" },
      { id: 4, title: "Prime", date: "2026-05-30", time: "21:00", sport: "tv" },
    ]

    const tonight = pickTonightEvents(events, "2026-05-30")
    expect(tonight.map((e) => e.id)).toEqual([4, 2])
  })
})

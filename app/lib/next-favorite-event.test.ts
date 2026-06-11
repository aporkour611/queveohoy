import { describe, expect, it } from "vitest"
import { pickNextFavoriteEvent } from "./next-favorite-event"
import type { EventRow } from "../components/types"

function event(partial: Partial<EventRow> & Pick<EventRow, "id" | "title" | "date">): EventRow {
  return {
    time: "21:00",
    sport: "futbol",
    competition: null,
    platform: null,
    channels: null,
    slug: null,
    ...partial,
  } as EventRow
}

describe("pickNextFavoriteEvent", () => {
  it("picks nearest upcoming favorite", () => {
    const now = new Date("2026-06-11T12:00:00.000Z")
    const picked = pickNextFavoriteEvent(
      [
        event({ id: 1, title: "Tarjeta", date: "2026-06-15", time: "22:00" }),
        event({ id: 2, title: "Partido", date: "2026-06-11", time: "21:00" }),
        event({ id: 3, title: "Pasado", date: "2026-06-10", time: "21:00" }),
      ],
      now
    )

    expect(picked?.id).toBe(2)
    expect(picked?.title).toBe("Partido")
  })

  it("picks earliest when multiple upcoming", () => {
    const now = new Date("2026-06-11T12:00:00.000Z")
    const picked = pickNextFavoriteEvent(
      [
        event({ id: 1, title: "Tarde", date: "2026-06-11", time: "22:00" }),
        event({ id: 2, title: "Pronto", date: "2026-06-11", time: "20:00" }),
      ],
      now
    )

    expect(picked?.id).toBe(2)
  })

  it("returns null when all past", () => {
    const now = new Date("2026-06-20T12:00:00.000Z")
    const picked = pickNextFavoriteEvent(
      [event({ id: 1, title: "Ayer", date: "2026-06-10", time: "21:00" })],
      now
    )
    expect(picked).toBeNull()
  })
})

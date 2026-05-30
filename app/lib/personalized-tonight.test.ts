import { describe, expect, it } from "vitest"
import type { EventRow } from "../components/types"
import {
  filterEventsByUserPlatforms,
  pickPersonalizedTonightEvents,
  scoreTonightEvent,
} from "./personalized-tonight"

const base = (overrides: Partial<EventRow>): EventRow => ({
  id: 1,
  title: "Test evento",
  sport: "tv",
  date: "2026-05-30",
  time: "21:00",
  ...overrides,
})

describe("pickPersonalizedTonightEvents", () => {
  it("filtra por prime time", () => {
    const events = [
      base({ id: 1, time: "16:00" }),
      base({ id: 2, time: "21:00" }),
    ]
    const result = pickPersonalizedTonightEvents(events, "2026-05-30", {
      primeTime: "18:00",
    })
    expect(result.map((e) => e.id)).toEqual([2])
  })

  it("prioriza plataformas del usuario", () => {
    const events = [
      base({ id: 1, time: "20:00", platform: "Netflix" }),
      base({ id: 2, time: "20:30", platform: "DAZN" }),
    ]
    const result = pickPersonalizedTonightEvents(events, "2026-05-30", {
      userPlatforms: ["DAZN"],
      primeTime: "18:00",
      limit: 2,
    })
    expect(result[0]?.id).toBe(2)
  })
})

describe("scoreTonightEvent", () => {
  it("suma puntos por favorito y plataforma", () => {
    const event = base({ id: 7, platform: "Movistar+" })
    const plain = scoreTonightEvent(event, { userPlatforms: [], favoriteIds: new Set() })
    const boosted = scoreTonightEvent(event, {
      userPlatforms: ["Movistar+"],
      favoriteIds: new Set([7]),
    })
    expect(boosted).toBeGreaterThan(plain)
  })
})

describe("filterEventsByUserPlatforms", () => {
  it("sin plataformas devuelve todo", () => {
    const events = [base({ id: 1 })]
    expect(filterEventsByUserPlatforms(events, [])).toEqual(events)
  })

  it("filtra por coincidencia parcial", () => {
    const events = [
      base({ id: 1, platform: "DAZN LaLiga" }),
      base({ id: 2, platform: "Netflix" }),
    ]
    expect(filterEventsByUserPlatforms(events, ["DAZN"]).map((e) => e.id)).toEqual([1])
  })
})

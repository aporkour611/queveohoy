import { describe, expect, it } from "vitest"
import {
  ESPORTS_SPORT_IDS,
  MOTOR_SPORT_IDS,
  sortSportsEsportsEntries,
  splitMotorFromSportsEsports,
} from "./event-day-sports-split"

describe("event-day-sports-split", () => {
  it("separa motor del bloque deportes/e-sports", () => {
    const bySport = {
      tenis: { label: "Tenis", sportId: "tenis", events: [{ id: 1 }] },
      formula1: { label: "F1", sportId: "formula1", events: [{ id: 2 }] },
      csgo: { label: "CS2", sportId: "csgo", events: [{ id: 3 }] },
    }

    const { motor, sportsEsports } = splitMotorFromSportsEsports(bySport)

    expect(Object.keys(motor)).toEqual(["formula1"])
    expect(Object.keys(sportsEsports).sort()).toEqual(["csgo", "tenis"])
  })

  it("ordena e-sports después de deportes tradicionales", () => {
    const ordered = sortSportsEsportsEntries({
      csgo: { label: "CS2", sportId: "csgo", events: [] },
      tenis: { label: "Tenis", sportId: "tenis", events: [] },
      lol: { label: "LoL", sportId: "lol", events: [] },
    })

    expect(ordered.map((entry) => entry.sportId)).toEqual(["tenis", "csgo", "lol"])
  })

  it("expone ids de motor y e-sports", () => {
    expect(MOTOR_SPORT_IDS.has("formula1")).toBe(true)
    expect(ESPORTS_SPORT_IDS.has("valorant")).toBe(true)
  })
})

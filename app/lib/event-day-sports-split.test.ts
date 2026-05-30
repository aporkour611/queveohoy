import { describe, expect, it } from "vitest"
import {
  ESPORTS_SPORT_IDS,
  MOTOR_SPORT_IDS,
  sortEsportsEntries,
  sortMotorEntries,
  sortSportEntries,
  sortSportsEsportsEntries,
  splitMotorFromSportsEsports,
  splitSportsFromEsports,
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

  it("separa deportes tradicionales de e-sports", () => {
    const bySport = {
      tenis: { label: "Tenis", sportId: "tenis", events: [] },
      csgo: { label: "CS2", sportId: "csgo", events: [] },
      lol: { label: "LoL", sportId: "lol", events: [] },
    }

    const { sports, esports } = splitSportsFromEsports(bySport)

    expect(Object.keys(sports)).toEqual(["tenis"])
    expect(Object.keys(esports).sort()).toEqual(["csgo", "lol"])
  })

  it("ordena e-sports después de deportes tradicionales (legacy)", () => {
    const ordered = sortSportsEsportsEntries({
      csgo: { label: "CS2", sportId: "csgo", events: [] },
      tenis: { label: "Tenis", sportId: "tenis", events: [] },
      lol: { label: "LoL", sportId: "lol", events: [] },
    })

    expect(ordered.map((entry) => entry.sportId)).toEqual(["tenis", "csgo", "lol"])
  })

  it("ordena motor F1 → MotoGP → rally", () => {
    const ordered = sortMotorEntries({
      rally: { label: "Rally", sportId: "rally", events: [] },
      formula1: { label: "F1", sportId: "formula1", events: [] },
      motos: { label: "MotoGP", sportId: "motos", events: [] },
    })

    expect(ordered.map((entry) => entry.sportId)).toEqual(["formula1", "motos", "rally"])
  })

  it("ordena deportes y e-sports por etiqueta", () => {
    const sports = sortSportEntries({
      ufc: { label: "UFC", sportId: "ufc", events: [] },
      tenis: { label: "Tenis", sportId: "tenis", events: [] },
    })
    const esports = sortEsportsEntries({
      lol: { label: "LoL", sportId: "lol", events: [] },
      csgo: { label: "CS2", sportId: "csgo", events: [] },
    })

    expect(sports.map((e) => e.sportId)).toEqual(["tenis", "ufc"])
    expect(esports.map((e) => e.sportId)).toEqual(["csgo", "lol"])
  })

  it("expone ids de motor y e-sports", () => {
    expect(MOTOR_SPORT_IDS.has("formula1")).toBe(true)
    expect(ESPORTS_SPORT_IDS.has("valorant")).toBe(true)
  })
})

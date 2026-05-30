import { describe, expect, it } from "vitest"
import {
  eventMatchesUserPlatforms,
  parseUserPreferences,
  sanitizeUserPlatforms,
} from "./user-preferences"

describe("user-preferences", () => {
  it("parsea filas de Supabase", () => {
    expect(
      parseUserPreferences({
        platforms: ["Netflix", "DAZN"],
        prime_time: "20:00",
        hidden_sports: ["dota2"],
        spoilers_off: true,
      })
    ).toEqual({
      platforms: ["Netflix", "DAZN"],
      primeTime: "20:00",
      hiddenSports: ["dota2"],
      spoilersOff: true,
    })
  })

  it("filtra eventos por plataformas del usuario", () => {
    expect(
      eventMatchesUserPlatforms("Movistar LaLiga · DAZN", ["DAZN"])
    ).toBe(true)
    expect(eventMatchesUserPlatforms("Netflix", ["DAZN"])).toBe(false)
    expect(eventMatchesUserPlatforms("Netflix", [])).toBe(false)
  })

  it("sanitiza plataformas desconocidas", () => {
    expect(
      sanitizeUserPlatforms(["Netflix", "PirataTV", "DAZN"])
    ).toEqual(["Netflix", "DAZN"])
  })
})

import { describe, expect, it } from "vitest"
import {
  isMadridMidnightHour,
  madridCalendarDay,
  msUntilNextMadridMidnight,
} from "./madrid-midnight"

describe("madrid-midnight", () => {
  it("msUntilNextMadridMidnight es positivo", () => {
    expect(msUntilNextMadridMidnight()).toBeGreaterThan(0)
  })

  it("isMadridMidnightHour detecta hora 0 Madrid", () => {
    const noonUtc = new Date("2026-06-10T22:00:00.000Z")
    expect(isMadridMidnightHour(noonUtc)).toBe(true)
  })

  it("madridCalendarDay respeta la fecha de referencia", () => {
    expect(madridCalendarDay(new Date("2026-06-10T22:00:00.000Z"))).toBe(
      "2026-06-11"
    )
  })
})

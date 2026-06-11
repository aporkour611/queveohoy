import { getMadridTodayKey } from "./seo-date"
import { addDaysToDateKey, madridDateTimeToUtc } from "./madrid-time"

export function isMadridMidnightHour(now = new Date()): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      hour: "numeric",
      hour12: false,
    }).format(now)
  )
  return hour === 0
}

/** Milisegundos hasta 00:00:05 del día siguiente en Madrid. */
export function msUntilNextMadridMidnight(now = new Date()): number {
  const today = getMadridTodayKey()
  const tomorrow = addDaysToDateKey(today, 1)
  const target = madridDateTimeToUtc(tomorrow, "00:00:05")
  return Math.max(5_000, target.getTime() - now.getTime())
}

export function madridCalendarDay(now = new Date()): string {
  return getMadridTodayKey()
}

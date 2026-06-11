"use client"

import { useEffect } from "react"
import { msUntilNextMadridMidnight } from "@/app/lib/madrid-midnight"

const STORAGE_KEY = "qvh-calendar-day"
/** Revisa cambio de día en Madrid sin saturar red en pestañas largas abiertas. */
const POLL_MS = 15 * 60_000

/**
 * Recarga la página cuando cambia el día en Madrid (calendario + feed).
 * Útil si el usuario deja la pestaña abierta de un día para otro.
 */
export function CalendarDayRefresh() {
  useEffect(() => {
    let cancelled = false
    let midnightTimer: number | undefined

    const scheduleMidnightReload = () => {
      if (midnightTimer !== undefined) window.clearTimeout(midnightTimer)
      midnightTimer = window.setTimeout(() => {
        window.location.reload()
      }, msUntilNextMadridMidnight())
    }

    const syncCalendarDay = async () => {
      if (document.visibilityState === "hidden") return
      try {
        const res = await fetch("/api/feed-meta", { cache: "no-store" })
        if (!res.ok) return
        const body = (await res.json()) as { date?: string }
        const day = body.date?.trim()
        if (!day) return

        const previous = sessionStorage.getItem(STORAGE_KEY)
        sessionStorage.setItem(STORAGE_KEY, day)

        if (previous && previous !== day && !cancelled) {
          window.location.reload()
        }
      } catch {
        /* ignore */
      }
    }

    void syncCalendarDay()
    scheduleMidnightReload()

    const poll = window.setInterval(() => {
      void syncCalendarDay()
    }, POLL_MS)

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void syncCalendarDay()
        scheduleMidnightReload()
      }
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      cancelled = true
      window.clearInterval(poll)
      if (midnightTimer !== undefined) window.clearTimeout(midnightTimer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  return null
}

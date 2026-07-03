"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate"

const CalendarDayRefresh = dynamic(
  () =>
    import("./CalendarDayRefresh").then((mod) => mod.CalendarDayRefresh),
  { ssr: false }
)

const Analytics = dynamic(
  () => import("./Analytics").then((mod) => mod.Analytics),
  { ssr: false }
)

const SpeedInsights = dynamic(
  () => import("./SpeedInsights").then((mod) => mod.SpeedInsights),
  { ssr: false }
)

/** Carga diferida de telemetría y utilidades no críticas (menor TBT en carga). */
export function DeferredLayoutClients() {
  const deferHeavy = shouldDeferHeavyClient()
  const [calendarReady, setCalendarReady] = useState(false)

  useEffect(() => {
    if (deferHeavy) return
    const schedule = () => setCalendarReady(true)
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(schedule, { timeout: 12_000 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = window.setTimeout(schedule, 12_000)
    return () => window.clearTimeout(timer)
  }, [deferHeavy])

  if (deferHeavy) return null

  return (
    <>
      {calendarReady ? <CalendarDayRefresh /> : null}
      <Analytics />
      <SpeedInsights />
    </>
  )
}

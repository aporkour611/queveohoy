"use client"

import { useEffect, useState, type ComponentType } from "react"
import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate"

/** Carga diferida sin next/dynamic (evita preload en `<head>`). */
export function DeferredLayoutClients() {
  const deferHeavy = shouldDeferHeavyClient()
  const [CalendarDayRefresh, setCalendarDayRefresh] =
    useState<ComponentType | null>(null)
  const [telemetry, setTelemetry] = useState<{
    Analytics: ComponentType
    SpeedInsights: ComponentType
  } | null>(null)

  useEffect(() => {
    if (deferHeavy) return
    const scheduleCalendar = () => {
      void import("./CalendarDayRefresh").then((mod) => {
        setCalendarDayRefresh(() => mod.CalendarDayRefresh)
      })
    }
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(scheduleCalendar, { timeout: 12_000 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = window.setTimeout(scheduleCalendar, 12_000)
    return () => window.clearTimeout(timer)
  }, [deferHeavy])

  useEffect(() => {
    if (deferHeavy) return
    const scheduleTelemetry = () => {
      void Promise.all([
        import("./Analytics"),
        import("./SpeedInsights"),
      ]).then(([analytics, insights]) => {
        setTelemetry({
          Analytics: analytics.Analytics,
          SpeedInsights: insights.SpeedInsights,
        })
      })
    }
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(scheduleTelemetry, { timeout: 15_000 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = window.setTimeout(scheduleTelemetry, 15_000)
    return () => window.clearTimeout(timer)
  }, [deferHeavy])

  if (deferHeavy) return null

  const Analytics = telemetry?.Analytics
  const SpeedInsights = telemetry?.SpeedInsights

  return (
    <>
      {CalendarDayRefresh ? <CalendarDayRefresh /> : null}
      {Analytics && SpeedInsights ? (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      ) : null}
    </>
  )
}

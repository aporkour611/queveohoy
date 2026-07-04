"use client"

import { useEffect, useState, type ComponentType } from "react"
import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate"

type PromptBundle = {
  CookieConsentBanner: ComponentType
  PushNotificationPrompt: ComponentType
  InstallAppPrompt: ComponentType
}

type TelemetryBundle = {
  Analytics: ComponentType
  SpeedInsights: ComponentType
}

/**
 * Un solo boundary de layout: prompts + telemetría + refresh calendario.
 * Evita múltiples hidrataciones del runtime React (chunk 3794).
 */
export function LayoutClientShell() {
  const deferHeavy = shouldDeferHeavyClient()
  const [prompts, setPrompts] = useState<PromptBundle | null>(null)
  const [CalendarDayRefresh, setCalendarDayRefresh] =
    useState<ComponentType | null>(null)
  const [telemetry, setTelemetry] = useState<TelemetryBundle | null>(null)

  useEffect(() => {
    if (deferHeavy) return
    const schedulePrompts = () => {
      void Promise.all([
        import("./CookieConsentBanner"),
        import("./PushNotifications"),
        import("./InstallAppPrompt"),
      ]).then(([banner, push, install]) => {
        setPrompts({
          CookieConsentBanner: banner.CookieConsentBanner,
          PushNotificationPrompt: push.PushNotificationPrompt,
          InstallAppPrompt: install.InstallAppPrompt,
        })
      })
    }
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(schedulePrompts, { timeout: 45_000 })
      return () => window.cancelIdleCallback(idleId)
    }
    const fallback = window.setTimeout(schedulePrompts, 45_000)
    return () => window.clearTimeout(fallback)
  }, [deferHeavy])

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
      {prompts ? (
        <>
          <prompts.CookieConsentBanner />
          <prompts.PushNotificationPrompt />
          <prompts.InstallAppPrompt />
        </>
      ) : null}
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

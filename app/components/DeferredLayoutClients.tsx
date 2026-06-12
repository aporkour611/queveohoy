"use client"

import dynamic from "next/dynamic"
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

/** Carga diferida de telemetría y utilidades no críticas (menor FID en carga). */
export function DeferredLayoutClients() {
  if (shouldDeferHeavyClient()) return null

  return (
    <>
      <CalendarDayRefresh />
      <Analytics />
      <SpeedInsights />
    </>
  )
}

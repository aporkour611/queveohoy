"use client"

import { useEffect, useState, type ComponentProps, type ComponentType } from "react"
import { shouldDeferHeavyClient, subscribeFeedHydration } from "@/app/lib/interaction-gate"
import type { AdSlot } from "./AdSlot"
import type { HomeFeedClientLayer } from "./HomeFeedClientLayer"

type Hydration = ComponentProps<typeof HomeFeedClientLayer>["hydration"]
type AdSlotProps = ComponentProps<typeof AdSlot>

type Props = {
  hydration: Hydration
  adSlot: AdSlotProps
}

/**
 * Un solo boundary en home: feed interactivo + slot de anuncios.
 * import() diferido; sin next/dynamic (evita preload chunk 3794).
 */
export function HomePageClientShell({ hydration, adSlot }: Props) {
  const deferHeavy = shouldDeferHeavyClient()
  const [Layer, setLayer] = useState<
    ComponentType<{ hydration: Hydration }> | null
  >(null)
  const [AdSlotComponent, setAdSlotComponent] = useState<
    ComponentType<AdSlotProps> | null
  >(null)

  useEffect(() => {
    if (deferHeavy) return
    const hasSsrContent = (hydration.initialEventCount ?? 0) > 0
    return subscribeFeedHydration({
      desktopIdleMs: hasSsrContent ? 1_200 : 4_000,
      touchIdleMs: hasSsrContent ? 600 : 2_500,
      onActivate: () => {
        void import("./HomeFeedClientLayer").then((mod) => {
          setLayer(() => mod.HomeFeedClientLayer)
        })
      },
    })
  }, [deferHeavy, hydration.initialEventCount])

  useEffect(() => {
    if (deferHeavy) return
    const schedule = () => {
      void import("./AdSlot").then((mod) => setAdSlotComponent(() => mod.AdSlot))
    }
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(schedule, { timeout: 8_000 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = window.setTimeout(schedule, 8_000)
    return () => window.clearTimeout(timer)
  }, [deferHeavy])

  if (deferHeavy) return null

  return (
    <>
      {AdSlotComponent ? <AdSlotComponent {...adSlot} /> : null}
      {Layer ? <Layer hydration={hydration} /> : null}
    </>
  )
}

"use client"

import { useEffect, useState, type ComponentProps, type ComponentType } from "react"
import { shouldDeferHeavyClient, subscribeFeedHydration } from "@/app/lib/interaction-gate"
import type { HomeFeedClientLayer } from "./HomeFeedClientLayer"

type Hydration = ComponentProps<typeof HomeFeedClientLayer>["hydration"]

type Props = {
  hydration: Hydration
}

/**
 * Sin next/dynamic: evita preload del chunk 3794 en `<head>` (PSI).
 * import() solo tras subscribeFeedHydration / interacción real.
 */
export function HomeFeedClientMount({ hydration }: Props) {
  const deferHeavy = shouldDeferHeavyClient()
  const [Layer, setLayer] = useState<
    ComponentType<{ hydration: Hydration }> | null
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

  if (deferHeavy || !Layer) return null
  return <Layer hydration={hydration} />
}

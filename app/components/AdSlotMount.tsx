"use client"

import { useEffect, useState, type ComponentProps, type ComponentType } from "react"
import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate"
import type { AdSlot } from "./AdSlot"

type Props = ComponentProps<typeof AdSlot>

/** Sin next/dynamic — evita preload del chunk de ads en `<head>`. */
export function AdSlotMount(props: Props) {
  const deferHeavy = shouldDeferHeavyClient()
  const [Slot, setSlot] = useState<ComponentType<Props> | null>(null)

  useEffect(() => {
    if (deferHeavy) return
    const schedule = () => {
      void import("./AdSlot").then((mod) => setSlot(() => mod.AdSlot))
    }
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(schedule, { timeout: 8_000 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = window.setTimeout(schedule, 8_000)
    return () => window.clearTimeout(timer)
  }, [deferHeavy])

  if (deferHeavy || !Slot) return null
  return <Slot {...props} />
}

"use client"

import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate"
import type { ComponentProps } from "react"
import { FeedHydrationBootstrap } from "./FeedHydrationBootstrap"

type Props = ComponentProps<typeof FeedHydrationBootstrap>

/** PSI/Lighthouse: sin next/dynamic (evita preload); bootstrap es ~2 KB. */
export function FeedHydrationGate(props: Props) {
  if (typeof window === "undefined") return null
  if (shouldDeferHeavyClient()) return null
  return <FeedHydrationBootstrap {...props} />
}

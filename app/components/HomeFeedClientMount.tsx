"use client"

import dynamic from "next/dynamic"
import type { ComponentProps } from "react"
import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate"
import type { HomeFeedClientLayer } from "./HomeFeedClientLayer"

const Layer = dynamic(
  () =>
    import("./HomeFeedClientLayer").then((mod) => mod.HomeFeedClientLayer),
  { ssr: false, loading: () => null }
)

type Props = {
  hydration: ComponentProps<typeof HomeFeedClientLayer>["hydration"]
}

export function HomeFeedClientMount({ hydration }: Props) {
  if (shouldDeferHeavyClient()) return null
  return <Layer hydration={hydration} />
}

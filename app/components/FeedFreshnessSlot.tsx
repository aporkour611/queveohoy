"use client"

import dynamic from "next/dynamic"

const FeedFreshness = dynamic(
  () => import("./FeedFreshness").then((mod) => mod.FeedFreshness),
  { ssr: false, loading: () => null }
)

type Props = {
  initialEventCount: number
}

/** Montado solo tras FeedClientRoots (gate externo). */
export function FeedFreshnessSlot({ initialEventCount }: Props) {
  return <FeedFreshness initialEventCount={initialEventCount} />
}

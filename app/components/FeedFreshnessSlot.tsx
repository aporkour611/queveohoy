"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { subscribeInteractionGate } from "@/app/lib/interaction-gate"

const FeedFreshness = dynamic(
  () => import("./FeedFreshness").then((mod) => mod.FeedFreshness),
  { ssr: false, loading: () => null }
)

type Props = {
  initialEventCount: number
}

/** Monta frescura del feed tras interacción (mobile) o idle (desktop). */
export function FeedFreshnessSlot({ initialEventCount }: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    return subscribeInteractionGate({
      desktopIdleMs: 3_500,
      onActivate: () => setReady(true),
    })
  }, [])

  if (!ready) {
    return (
      <p className="qvh-feed-freshness qvh-feed-freshness-ssr" aria-hidden>
        {initialEventCount > 0
          ? `${initialEventCount} eventos en ventana`
          : null}
      </p>
    )
  }

  return <FeedFreshness initialEventCount={initialEventCount} />
}

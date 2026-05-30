"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const FeedFreshness = dynamic(
  () => import("./FeedFreshness").then((mod) => mod.FeedFreshness),
  { ssr: false }
)

type Props = {
  initialEventCount: number
}

/** Monta frescura del feed tras idle — no bloquea LCP/INP. */
export function FeedFreshnessSlot({ initialEventCount }: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const activate = () => {
      if (!cancelled) setReady(true)
    }

    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(activate, { timeout: 4_000 })
        : null
    const fallback = window.setTimeout(activate, 3_500)

    return () => {
      cancelled = true
      if (idle !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idle)
      }
      window.clearTimeout(fallback)
    }
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

"use client"

import { useEffect } from "react"
import { subscribeInteractionGate } from "@/app/lib/interaction-gate"

/** CSS de deportes especiales — solo tras interacción (no bloquea FCP/LCP). */
export function FeedDeferredStyles() {
  useEffect(() => {
    let loaded = false
    const load = () => {
      if (loaded) return
      loaded = true
      void import("../feed-sports.css")
    }

    const cleanup = subscribeInteractionGate({
      desktopIdleMs: 2_500,
      onActivate: load,
    })

    return cleanup
  }, [])

  return null
}

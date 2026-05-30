"use client"

import { useEffect } from "react"
import { isSyntheticAudit } from "@/app/lib/interaction-gate"

/** CSS de deportes especiales — solo tras interacción (no bloquea FCP/LCP). */
export function FeedDeferredStyles() {
  useEffect(() => {
    if (isSyntheticAudit()) return

    let loaded = false
    const load = () => {
      if (loaded) return
      loaded = true
      void import("../feed-sports.css")
    }

    let fallback: number | undefined
    const touchPreferred =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 720px)").matches

    if (!touchPreferred) {
      fallback = window.setTimeout(load, 2_500)
    }

    const onTouch = () => load()
    document.addEventListener("touchstart", onTouch, { passive: true, once: true })

    return () => {
      if (fallback !== undefined) window.clearTimeout(fallback)
      document.removeEventListener("touchstart", onTouch)
    }
  }, [])

  return null
}

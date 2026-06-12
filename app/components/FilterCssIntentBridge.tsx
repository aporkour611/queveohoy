"use client"

import { useEffect } from "react"
import { bindFilterCssIntent } from "@/app/lib/filter-css-preload"
import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate"

/** Prefetch CSS de filtros al hover/focus sobre el shell SSR (sin hidratar HomeFeed). */
export function FilterCssIntentBridge() {
  useEffect(() => {
    if (shouldDeferHeavyClient()) return

    const attach = () => bindFilterCssIntent()
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(attach, { timeout: 5000 })
      return () => window.cancelIdleCallback(idleId)
    }

    const fallback = window.setTimeout(attach, 2000)
    return () => window.clearTimeout(fallback)
  }, [])
  return null
}

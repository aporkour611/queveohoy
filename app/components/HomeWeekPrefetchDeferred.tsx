"use client"

import { useEffect } from "react"
import {
  HOME_FEED_WEEK_PREFETCH_URL,
  PUBLIC_WEEK_FEED_PREFETCH_URL,
} from "@/app/lib/home-feed-intent"

/** Prefetch del feed semanal tras idle (no compite con LCP en cold start). */
export function HomeWeekPrefetchDeferred() {
  useEffect(() => {
    const inject = () => {
      for (const href of [
        HOME_FEED_WEEK_PREFETCH_URL,
        PUBLIC_WEEK_FEED_PREFETCH_URL,
      ]) {
        if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
          continue
        }
        const link = document.createElement("link")
        link.rel = "prefetch"
        link.href = href
        link.as = "fetch"
        link.crossOrigin = "anonymous"
        document.head.appendChild(link)
      }
    }

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(inject, { timeout: 8000 })
      return () => window.cancelIdleCallback(id)
    }

    const timer = window.setTimeout(inject, 12_000)
    return () => window.clearTimeout(timer)
  }, [])

  return null
}

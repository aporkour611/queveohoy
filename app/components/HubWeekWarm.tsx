"use client"

import { useEffect } from "react"
import {
  prefetchHomeFeedWeekOnce,
  prefetchPublicWeekFeedOnce,
} from "@/app/lib/perf-prefetch"

/** Calienta caché semanal en hubs SEO `/agenda/*`. */
export function HubWeekWarm() {
  useEffect(() => {
    prefetchHomeFeedWeekOnce()
    prefetchPublicWeekFeedOnce()
  }, [])

  return null
}

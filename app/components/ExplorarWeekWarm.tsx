"use client"

import { useEffect } from "react"
import { prefetchHomeFeedWeekOnce, prefetchPublicWeekFeedOnce } from "@/app/lib/perf-prefetch"

/** Calienta caché del feed semanal al entrar en /explorar. */
export function ExplorarWeekWarm() {
  useEffect(() => {
    prefetchHomeFeedWeekOnce()
    prefetchPublicWeekFeedOnce()
  }, [])

  return null
}

"use client"

import { useEffect } from "react"
import { prefetchHomeFeedWeekOnce } from "@/app/lib/perf-prefetch"

/** Calienta caché del feed semanal al entrar en /explorar. */
export function ExplorarWeekWarm() {
  useEffect(() => {
    prefetchHomeFeedWeekOnce()
  }, [])

  return null
}

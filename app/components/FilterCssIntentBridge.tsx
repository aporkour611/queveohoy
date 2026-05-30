"use client"

import { useEffect } from "react"
import { bindFilterCssIntent } from "@/app/lib/filter-css-preload"

/** Prefetch CSS de filtros al hover/focus sobre el shell SSR (sin hidratar HomeFeed). */
export function FilterCssIntentBridge() {
  useEffect(() => bindFilterCssIntent(), [])
  return null
}

"use client"

import { useEffect } from "react"
import { ALL_SPORT_IDS, STORAGE_KEY } from "../lib/filter-config"
import { readFilterParamFromSearch } from "../lib/filter-url"
import { TV_SPORT_FILTER_IDS } from "../lib/tv-show-category"
import { hasPreferenceConsent } from "../lib/cookie-consent"
import { deferClientStateUpdate } from "../lib/defer-client-state"

/** v17 — hidrata filtros desde URL o localStorage al montar HomePage. */
export function useHomeFilterBootstrap(
  setSelectedSports: (ids: string[]) => void
) {
  useEffect(() => {
    deferClientStateUpdate(() => {
      const fromUrl = readFilterParamFromSearch(window.location.search)
      if (fromUrl.length > 0) {
        setSelectedSports(fromUrl)
        return
      }

      if (!hasPreferenceConsent()) return

      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) return

        const parsed = JSON.parse(saved)
        if (!Array.isArray(parsed)) return

        setSelectedSports(
          [
            ...new Set(
              parsed.flatMap((id): string[] => {
                if (typeof id !== "string") return []
                if (id === "tv") return [...TV_SPORT_FILTER_IDS]
                return ALL_SPORT_IDS.includes(id) ? [id] : []
              })
            ),
          ]
        )
      } catch {
        /* ignore corrupt storage */
      }
    })
  }, [setSelectedSports])
}

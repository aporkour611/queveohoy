"use client"

import { useCallback, useEffect, useState } from "react"
import { COOKIE_CONSENT_EVENT, hasPreferenceConsent } from "../lib/cookie-consent"
import { deferClientStateUpdate } from "../lib/defer-client-state"

const ONLY_MY_PLATFORMS_KEY = "qvh-only-my-platforms"

export function useHomeOnlyMyPlatforms() {
  const [onlyMyPlatforms, setOnlyMyPlatforms] = useState(false)

  useEffect(() => {
    deferClientStateUpdate(() => {
      try {
        setOnlyMyPlatforms(localStorage.getItem(ONLY_MY_PLATFORMS_KEY) === "1")
      } catch {
        /* ignore */
      }
    })
  }, [])

  useEffect(() => {
    if (!hasPreferenceConsent()) return

    try {
      localStorage.setItem(ONLY_MY_PLATFORMS_KEY, onlyMyPlatforms ? "1" : "0")
    } catch {
      /* ignore */
    }
  }, [onlyMyPlatforms])

  useEffect(() => {
    const handleConsent = () => {
      if (!hasPreferenceConsent()) return
      try {
        setOnlyMyPlatforms(localStorage.getItem(ONLY_MY_PLATFORMS_KEY) === "1")
      } catch {
        /* ignore */
      }
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsent)
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsent)
  }, [])

  const handleOnlyMyPlatformsChange = useCallback((next: boolean) => {
    setOnlyMyPlatforms(next)
  }, [])

  return {
    onlyMyPlatforms,
    setOnlyMyPlatforms: handleOnlyMyPlatformsChange,
  }
}

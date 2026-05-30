"use client"

import { useEffect, useState } from "react"
import {
  readStoredUserPlatforms,
  USER_PLATFORMS_CHANGED_EVENT,
  USER_PLATFORMS_STORAGE_KEY,
} from "./user-platforms-client"

export function useUserPlatforms(): string[] {
  const [platforms, setPlatforms] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : readStoredUserPlatforms()
  )

  useEffect(() => {
    const refresh = () => setPlatforms(readStoredUserPlatforms())

    const handleStorage = (event: StorageEvent) => {
      if (event.key === USER_PLATFORMS_STORAGE_KEY) refresh()
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener(USER_PLATFORMS_CHANGED_EVENT, refresh)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener(USER_PLATFORMS_CHANGED_EVENT, refresh)
    }
  }, [])

  return platforms
}

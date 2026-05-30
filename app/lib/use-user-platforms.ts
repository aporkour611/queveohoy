"use client"

import { useEffect, useState } from "react"
import { readStoredUserPlatforms } from "./user-platforms-client"

export function useUserPlatforms(): string[] {
  const [platforms, setPlatforms] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : readStoredUserPlatforms()
  )

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "qvh-user-platforms") {
        setPlatforms(readStoredUserPlatforms())
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return platforms
}

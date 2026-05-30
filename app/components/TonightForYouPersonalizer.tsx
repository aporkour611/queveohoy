"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import type { EventRow } from "./types"
import { hasPreferenceConsent } from "../lib/cookie-consent"
import { readStoredUserPlatforms } from "../lib/user-platforms-client"

const TonightForYouSection = dynamic(
  () =>
    import("./TonightForYouSection").then((mod) => mod.TonightForYouSection),
  { ssr: false }
)

type Props = {
  events: EventRow[]
  todayKey: string
}

function readStoredPlatforms(): string[] {
  if (!hasPreferenceConsent()) return []
  return readStoredUserPlatforms()
}

/** Solo hidrata «Para ti» personalizado si el usuario tiene plataformas guardadas. */
export function TonightForYouPersonalizer({ events, todayKey }: Props) {
  const [personalize, setPersonalize] = useState(false)

  useEffect(() => {
    let cancelled = false

    const check = () => {
      if (cancelled) return
      const platforms = readStoredPlatforms()
      if (platforms.length > 0) setPersonalize(true)
    }

    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(check, { timeout: 5_000 })
        : null
    const fallback = window.setTimeout(check, 4_000)

    return () => {
      cancelled = true
      if (idle !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idle)
      }
      window.clearTimeout(fallback)
    }
  }, [])

  useEffect(() => {
    if (!personalize) return
    document.querySelector(".qvh-tonight-ssr")?.setAttribute("hidden", "true")
  }, [personalize])

  if (!personalize) return null

  return (
    <div className="qvh-tonight-personalized" aria-live="polite">
      <TonightForYouSection events={events} todayKey={todayKey} />
    </div>
  )
}

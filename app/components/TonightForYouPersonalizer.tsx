"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import type { EventRow } from "./types"
import { hasPreferenceConsent } from "../lib/cookie-consent"
import { subscribeFeedScopedGate } from "../lib/interaction-gate"
import { readStoredUserPlatforms } from "../lib/user-platforms-client"

const TonightForYouSection = dynamic(
  () =>
    import("./TonightForYouSection").then((mod) => mod.TonightForYouSection),
  { ssr: false, loading: () => null }
)

type Props = {
  events: EventRow[]
  todayKey: string
}

function readStoredPlatforms(): string[] {
  if (!hasPreferenceConsent()) return []
  return readStoredUserPlatforms()
}

export function TonightForYouPersonalizer({ events, todayKey }: Props) {
  const [personalize, setPersonalize] = useState(false)

  useEffect(() => {
    return subscribeFeedScopedGate({
      desktopIdleMs: 4_000,
      onActivate: () => {
        const platforms = readStoredPlatforms()
        if (platforms.length > 0) setPersonalize(true)
      },
    })
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

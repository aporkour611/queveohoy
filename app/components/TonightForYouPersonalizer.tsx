"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import type { EventRow } from "./types"
import { hasPreferenceConsent } from "../lib/cookie-consent"
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

function hasStoredPlatforms(): boolean {
  return readStoredPlatforms().length > 0
}

/** Montado solo tras FeedClientRoots (gate externo). */
export function TonightForYouPersonalizer({ events, todayKey }: Props) {
  const [personalize] = useState(hasStoredPlatforms)

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

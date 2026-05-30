"use client"

import Link from "next/link"
import { useMemo } from "react"
import type { EventRow } from "./types"
import { pickPersonalizedTonightEvents } from "../lib/personalized-tonight"
import { useUserPlatforms } from "../lib/use-user-platforms"
import { FeaturedEventCard } from "./FeaturedEventCard"

const PRIME_TIME_KEY = "qvh-prime-time"

function readPrimeTime(): string {
  if (typeof window === "undefined") return "18:00"
  try {
    return window.localStorage.getItem(PRIME_TIME_KEY)?.slice(0, 5) || "18:00"
  } catch {
    return "18:00"
  }
}

type Props = {
  events: EventRow[]
  todayKey: string
}

export function TonightForYouSection({ events, todayKey }: Props) {
  const userPlatforms = useUserPlatforms()

  const tonightEvents = useMemo(
    () =>
      pickPersonalizedTonightEvents(events, todayKey, {
        userPlatforms,
        primeTime: readPrimeTime(),
        limit: 6,
      }),
    [events, todayKey, userPlatforms]
  )

  if (tonightEvents.length === 0) return null

  const hasPlatforms = userPlatforms.length > 0

  return (
    <section className="qvh-tonight-for-you" aria-labelledby="qvh-tonight-title">
      <div className="qvh-tonight-head">
        <div>
          <p className="qvh-tonight-kicker">Para ti</p>
          <h2 id="qvh-tonight-title" className="qvh-tonight-title">
            Esta noche
          </h2>
          <p className="qvh-tonight-desc">
            {hasPlatforms
              ? "Priorizamos tus plataformas y lo más importante del prime time."
              : "Prime time desde las 18:00 h. Configura plataformas en tu cuenta para personalizar."}
          </p>
        </div>
        {!hasPlatforms ? (
          <Link href="/cuenta" className="qvh-tonight-cta">
            Mis plataformas
          </Link>
        ) : null}
      </div>
      <ul className="qvh-tonight-grid">
        {tonightEvents.map((event) => (
          <li key={event.id ?? `${event.title}-${event.time}`}>
            <FeaturedEventCard event={event} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function syncPrimeTimeToStorage(primeTime: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(PRIME_TIME_KEY, primeTime.slice(0, 5))
  } catch {
    /* ignore */
  }
}

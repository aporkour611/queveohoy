"use client"

import { useEffect, useRef, useState } from "react"
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config"

type FeedMeta = {
  generatedAt: string
  eventCount: number
  revalidateSeconds: number
}

function formatAge(iso: string, nowMs: number): string {
  const diffMs = nowMs - new Date(iso).getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60_000))
  if (minutes < 1) return "hace un momento"
  if (minutes === 1) return "hace 1 min"
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  return hours === 1 ? "hace 1 h" : `hace ${hours} h`
}

function buildDisplay(body: FeedMeta, nowMs: number) {
  const ageMs = nowMs - new Date(body.generatedAt).getTime()
  return {
    label: formatAge(body.generatedAt, nowMs),
    stale: ageMs > body.revalidateSeconds * 1.5 * 1000,
  }
}

export function FeedFreshness() {
  const [meta, setMeta] = useState<FeedMeta | null>(null)
  const [display, setDisplay] = useState<{ label: string; stale: boolean } | null>(
    null
  )
  const metaRef = useRef<FeedMeta | null>(null)

  useEffect(() => {
    let cancelled = false

    const syncDisplay = (body: FeedMeta) => {
      metaRef.current = body
      setMeta(body)
      setDisplay(buildDisplay(body, Date.now()))
    }

    const load = async () => {
      try {
        const res = await fetch("/api/feed-meta", { cache: "no-store" })
        if (!res.ok) return
        const body = (await res.json()) as FeedMeta
        if (!cancelled) syncDisplay(body)
      } catch {
        /* ignore */
      }
    }

    void load()
    const timer = window.setInterval(() => {
      if (metaRef.current) {
        setDisplay(buildDisplay(metaRef.current, Date.now()))
      }
      void load()
    }, 120_000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  if (!meta?.generatedAt || !display) return null

  return (
    <p
      className={`qvh-feed-freshness${display.stale ? " is-stale" : ""}`}
      aria-live="polite"
    >
      <span className="qvh-feed-freshness-dot" aria-hidden />
      Agenda actualizada {display.label}
      {meta.eventCount > 0 ? ` · ${meta.eventCount} eventos en ventana` : null}
    </p>
  )
}

/** Constante exportada para tests. */
export const FEED_FRESHNESS_DEFAULT_REVALIDATE = FEED_REVALIDATE_SECONDS

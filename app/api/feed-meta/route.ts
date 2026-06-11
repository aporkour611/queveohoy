import { NextResponse } from "next/server"
import { enforceApiRateLimit, rateLimitResponse } from "@/app/lib/api-rate-limit"
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config"
import {
  fetchFeedEvents,
  fetchWeekViewFeedEvents,
} from "@/app/lib/events-feed-server"
import { getMadridTodayKey } from "@/app/lib/seo-date"
import { MADRID_TZ } from "@/app/lib/timezone"

/** Frescura del feed: CDN 60s (evitar force-dynamic que pisa Cache-Control). */
export const revalidate = 60

export async function GET(request: Request) {
  const rate = await enforceApiRateLimit(request, "feed-meta")
  if (!rate.ok) return rateLimitResponse(rate.retryAfterSec)

  const [{ events, error }, weekFeed] = await Promise.all([
    fetchFeedEvents(),
    fetchWeekViewFeedEvents(),
  ])
  const todayKey = getMadridTodayKey()
  const todayCount = events.filter((e) => e.date === todayKey).length

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      timezone: MADRID_TZ,
      date: todayKey,
      eventCount: events.length,
      todayCount,
      weekCount: weekFeed.events.length,
      revalidateSeconds: FEED_REVALIDATE_SECONDS,
      error: error ?? weekFeed.error ?? null,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        Vary: "Accept-Encoding",
      },
    }
  )
}

import { NextResponse } from "next/server"
import { enforceApiRateLimit, rateLimitResponse } from "@/app/lib/api-rate-limit"
import {
  fetchFeedEvents,
  fetchWeekViewFeedEvents,
} from "@/app/lib/events-feed-server"
import { buildFeedMetaPayload } from "@/app/lib/feed-meta-payload"

/** Frescura del feed: CDN 60s (evitar force-dynamic que pisa Cache-Control). */
export const revalidate = 60

export async function GET(request: Request) {
  const rate = await enforceApiRateLimit(request, "feed-meta")
  if (!rate.ok) return rateLimitResponse(rate.retryAfterSec)

  const [{ events, error }, weekFeed] = await Promise.all([
    fetchFeedEvents(),
    fetchWeekViewFeedEvents(),
  ])

  return NextResponse.json(
    buildFeedMetaPayload({
      events,
      weekEvents: weekFeed.events,
      feedError: error,
      weekError: weekFeed.error,
    }),
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        Vary: "Accept-Encoding",
      },
    }
  )
}

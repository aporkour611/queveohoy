import { NextResponse } from "next/server"
import { enforceApiRateLimit, rateLimitResponse } from "@/app/lib/api-rate-limit"
import {
  fetchFeedEvents,
  fetchWeekViewFeedEvents,
} from "@/app/lib/events-feed-server"
import { buildFeedMetaPayload } from "@/app/lib/feed-meta-payload"
import { buildFeedMetaEtag, feedNotModified } from "@/app/lib/feed-etag"

/** Frescura del feed: CDN 60s (evitar force-dynamic que pisa Cache-Control). */
export const revalidate = 60

export async function GET(request: Request) {
  const rate = await enforceApiRateLimit(request, "feed-meta")
  if (!rate.ok) return rateLimitResponse(rate.retryAfterSec)

  const [{ events, error }, weekFeed] = await Promise.all([
    fetchFeedEvents(),
    fetchWeekViewFeedEvents(),
  ])

  const payload = buildFeedMetaPayload({
    events,
    weekEvents: weekFeed.events,
    feedError: error,
    weekError: weekFeed.error,
  })
  const etag = buildFeedMetaEtag(payload)

  if (feedNotModified(request, etag)) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
        Vary: "Accept-Encoding",
      },
    })
  }

  return NextResponse.json(payload, {
    headers: {
      ETag: etag,
      "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
      Vary: "Accept-Encoding",
    },
  })
}

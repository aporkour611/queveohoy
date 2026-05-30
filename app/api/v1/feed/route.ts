import { NextRequest, NextResponse } from "next/server"
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config"
import { fetchFeedEvents } from "@/app/lib/events-feed-server"
import {
  buildPublicApiFeedResponse,
  enforcePublicApiRateLimit,
  filterPublicApiEventsByDate,
  publicApiCorsHeaders,
  toPublicApiEvents,
} from "@/app/lib/public-api"
import { getMadridTodayKey } from "@/app/lib/seo-date"
import { MADRID_TZ } from "@/app/lib/timezone"

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: publicApiCorsHeaders(),
  })
}

export async function GET(request: NextRequest) {
  const rate = enforcePublicApiRateLimit(request)
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfterSec: rate.retryAfterSec },
      {
        status: 429,
        headers: {
          ...publicApiCorsHeaders(),
          "Retry-After": String(rate.retryAfterSec),
        },
      }
    )
  }

  const dateParam = request.nextUrl.searchParams.get("date")
  const todayKey = getMadridTodayKey()
  const dateKey =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayKey

  const { events, error } = await fetchFeedEvents()
  if (error) {
    return NextResponse.json(
      { error, events: [] },
      {
        status: 502,
        headers: publicApiCorsHeaders(),
      }
    )
  }

  const publicEvents = dateParam
    ? filterPublicApiEventsByDate(events, dateKey)
    : toPublicApiEvents(events).filter((event) => event.date === dateKey)

  const body = buildPublicApiFeedResponse(publicEvents, dateKey, MADRID_TZ)

  return NextResponse.json(body, {
    headers: {
      ...publicApiCorsHeaders(),
      "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
      Vary: "Accept-Encoding",
    },
  })
}

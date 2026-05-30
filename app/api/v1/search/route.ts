import { NextRequest, NextResponse } from "next/server"
import { filterEventsByAgendaQuery } from "@/app/lib/agenda-search"
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config"
import { fetchFeedEvents } from "@/app/lib/events-feed-server"
import {
  enforcePublicApiRateLimitAsync,
  paginatePublicApiEvents,
  parsePublicApiPageSize,
  publicApiCorsHeaders,
  toPublicApiEvents,
} from "@/app/lib/public-api"
import { getMadridTodayKey } from "@/app/lib/seo-date"

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: publicApiCorsHeaders(),
  })
}

export async function GET(request: NextRequest) {
  const rate = await enforcePublicApiRateLimitAsync(request)
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

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters", events: [] },
      { status: 400, headers: publicApiCorsHeaders() }
    )
  }

  const limit = parsePublicApiPageSize(request.nextUrl.searchParams.get("limit"))
  const cursor = request.nextUrl.searchParams.get("cursor")
  const dateParam = request.nextUrl.searchParams.get("date")
  const todayKey = getMadridTodayKey()
  const dateKey =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayKey

  const { events, error } = await fetchFeedEvents()
  if (error) {
    return NextResponse.json(
      { error, events: [] },
      { status: 502, headers: publicApiCorsHeaders() }
    )
  }

  const matched = filterEventsByAgendaQuery(events, q)
  const dated = dateParam
    ? matched.filter((event) => event.date === dateKey)
    : matched
  const publicEvents = toPublicApiEvents(dated)
  const page = paginatePublicApiEvents(publicEvents, { limit, cursor })

  return NextResponse.json(
    {
      version: "1",
      generatedAt: new Date().toISOString(),
      query: q,
      date: dateKey,
      count: page.events.length,
      events: page.events,
      nextCursor: page.nextCursor,
      docs: "https://queveohoy.es/desarrolladores",
    },
    {
      headers: {
        ...publicApiCorsHeaders(),
        "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
        Vary: "Accept-Encoding",
      },
    }
  )
}

import { NextRequest, NextResponse } from "next/server"
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config"
import { fetchFeedEvents } from "@/app/lib/events-feed-server"
import {
  buildPublicApiFeedResponse,
  enforcePublicApiRateLimit,
  filterPublicApiEventsByCategories,
  filterPublicApiEventsByDate,
  paginatePublicApiEvents,
  parsePublicApiCategories,
  parsePublicApiPageSize,
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

  const limit = parsePublicApiPageSize(request.nextUrl.searchParams.get("limit"))
  const cursor = request.nextUrl.searchParams.get("cursor")
  const categories = parsePublicApiCategories(
    request.nextUrl.searchParams.get("categories")
  )

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

  let publicEvents = dateParam
    ? filterPublicApiEventsByDate(events, dateKey)
    : toPublicApiEvents(events).filter((event) => event.date === dateKey)

  if (categories.length > 0) {
    publicEvents = filterPublicApiEventsByCategories(events, categories).filter(
      (event) => event.date === dateKey
    )
  }

  const page = paginatePublicApiEvents(publicEvents, { limit, cursor })
  const body = buildPublicApiFeedResponse(
    page.events,
    dateKey,
    MADRID_TZ,
    page.nextCursor,
    categories.length > 0 ? categories : undefined
  )

  return NextResponse.json(body, {
    headers: {
      ...publicApiCorsHeaders(),
      "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
      Vary: "Accept-Encoding",
    },
  })
}

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { FEED_REVALIDATE_SECONDS } from "./cache-config"
import { fetchFeedEvents } from "./events-feed-server"
import {
  enforcePublicFeedRateLimit,
  extractApiKeyFromRequest,
} from "./partner-api"
import { PUBLIC_API_RATE_WINDOW_MS } from "./public-api"
import {
  buildPublicApiFeedResponse,
  buildPublicApiV2FeedResponse,
  filterPublicApiEventsByCategories,
  filterPublicApiEventsByDate,
  paginatePublicApiEvents,
  parsePublicApiCategories,
  parsePublicApiPageSize,
  publicApiCorsHeaders,
  toPublicApiEvents,
} from "./public-api"
import { getMadridTodayKey } from "./seo-date"
import { MADRID_TZ } from "./timezone"

export type PublicFeedApiVersion = "1" | "2"

export async function handlePublicFeedGet(
  request: NextRequest,
  version: PublicFeedApiVersion
): Promise<NextResponse> {
  const rate = await enforcePublicFeedRateLimit(request, {
    allowPartnerKeys: version === "2",
  })

  if (!rate.ok) {
    const provided = extractApiKeyFromRequest(request)
    if (version === "2" && provided && !rate.partner) {
      return NextResponse.json(
        { error: "Invalid partner API key" },
        { status: 401, headers: publicApiCorsHeaders() }
      )
    }

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
  const categoriesApplied =
    categories.length > 0 ? categories : undefined

  const cacheControl = `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`

  if (version === "2") {
    const body = buildPublicApiV2FeedResponse(
      page.events,
      dateKey,
      MADRID_TZ,
      page.nextCursor,
      categoriesApplied,
      rate.partner ?? undefined,
      {
        limit: rate.limit,
        windowSec: PUBLIC_API_RATE_WINDOW_MS / 1000,
      }
    )

    const ifNoneMatch = request.headers.get("if-none-match")
    if (ifNoneMatch && ifNoneMatch === body.etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ...publicApiCorsHeaders(),
          ETag: body.etag,
          "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}`,
        },
      })
    }

    return NextResponse.json(body, {
      headers: {
        ...publicApiCorsHeaders(),
        ETag: body.etag,
        "Cache-Control": cacheControl,
        Vary: "Accept-Encoding",
      },
    })
  }

  const body = buildPublicApiFeedResponse(
    page.events,
    dateKey,
    MADRID_TZ,
    page.nextCursor,
    categoriesApplied
  )

  return NextResponse.json(body, {
    headers: {
      ...publicApiCorsHeaders(),
      "Cache-Control": cacheControl,
      Vary: "Accept-Encoding",
    },
  })
}

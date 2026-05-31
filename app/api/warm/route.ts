import { NextResponse } from "next/server"
import { enforceApiRateLimit, rateLimitResponse } from "@/app/lib/api-rate-limit"
import {
  fetchDestacadosFeedEvents,
  fetchHomeFeedEvents,
} from "@/app/lib/events-feed-server"

export const dynamic = "force-dynamic"
export const maxDuration = 25

/**
 * Precalienta caché de feed (unstable_cache) y función serverless.
 * Invocado por cron Vercel / GitHub Actions para evitar cold start de horas.
 */
export async function GET(request: Request) {
  const rate = await enforceApiRateLimit(request, "warm", 40, 60_000)
  if (!rate.ok) return rateLimitResponse(rate.retryAfterSec)

  const started = Date.now()
  const [home, destacados] = await Promise.all([
    fetchHomeFeedEvents(),
    fetchDestacadosFeedEvents(),
  ])
  const ms = Date.now() - started

  const ok =
    home.events.length > 0 &&
    destacados.events.length > 0 &&
    !home.error &&
    !destacados.error

  return NextResponse.json(
    {
      ok,
      warmed: {
        home: home.events.length,
        destacados: destacados.events.length,
      },
      errors: {
        home: home.error,
        destacados: destacados.error,
      },
      ms,
      timestamp: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    }
  )
}

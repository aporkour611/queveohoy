import type { NextRequest } from "next/server"

const EDGE_RATE_LIMIT_PATHS = [
  "/api/v1/",
  "/api/v2/",
  "/api/events",
  "/api/home-feed",
  "/api/feed-meta",
  "/api/assistant",
] as const

const EDGE_RATE_LIMIT = 120
const EDGE_RATE_WINDOW_MS = 60_000

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown"
  return request.headers.get("x-real-ip")?.trim() ?? "unknown"
}

function shouldEdgeRateLimit(pathname: string): boolean {
  if (
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/warm") ||
    pathname.startsWith("/api/push/cron") ||
    pathname.startsWith("/api/admin/")
  ) {
    return false
  }
  return EDGE_RATE_LIMIT_PATHS.some((prefix) =>
    prefix.endsWith("/")
      ? pathname.startsWith(prefix)
      : pathname === prefix || pathname.startsWith(`${prefix}?`)
  )
}

/** Rate limit en Edge (Upstash REST) antes de arrancar funciones Node. */
export async function edgePublicApiRateLimit(
  request: NextRequest
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const pathname = request.nextUrl.pathname
  if (!shouldEdgeRateLimit(pathname)) {
    return { ok: true }
  }

  const baseUrl = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!baseUrl || !token) {
    return { ok: true }
  }

  const ip = clientIp(request)
  const redisKey = `qvh:edge:${ip}`
  const windowSec = Math.max(1, Math.ceil(EDGE_RATE_WINDOW_MS / 1000))

  try {
    const res = await fetch(`${baseUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, windowSec, "NX"],
        ["TTL", redisKey],
      ]),
    })

    if (!res.ok) return { ok: true }

    const results = (await res.json()) as { result?: number | string }[]
    const count = Number(results[0]?.result ?? 0)
    const ttl = Number(results[2]?.result ?? windowSec)

    if (count > EDGE_RATE_LIMIT) {
      return { ok: false, retryAfterSec: Math.max(1, ttl) }
    }

    return { ok: true }
  } catch {
    return { ok: true }
  }
}

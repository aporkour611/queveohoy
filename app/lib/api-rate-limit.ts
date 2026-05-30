import { checkRateLimitDistributed } from "./rate-limit-distributed"
import { clientIp } from "./rate-limit"

const DEFAULT_LIMIT = 60
const DEFAULT_WINDOW_MS = 60_000

export async function enforceApiRateLimit(
  request: Request,
  namespace: string,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const ip = clientIp(request)
  return checkRateLimitDistributed(`${namespace}:${ip}`, limit, windowMs)
}

export function rateLimitResponse(retryAfterSec: number): Response {
  return Response.json(
    { error: "Rate limit exceeded", retryAfterSec },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    }
  )
}

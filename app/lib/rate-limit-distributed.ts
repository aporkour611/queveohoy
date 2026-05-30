import { checkRateLimit } from "./rate-limit"

/**
 * Rate limit distribuido opcional vía Upstash Redis REST.
 * Si UPSTASH_REDIS_REST_URL/TOKEN no están definidos, usa Map in-process.
 */
export async function checkRateLimitDistributed(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  if (!baseUrl || !token) {
    return checkRateLimit(key, limit, windowMs)
  }

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000))
  const redisKey = `qvh:rl:${key}`

  try {
    const pipeline = [
      ["INCR", redisKey],
      ["EXPIRE", redisKey, windowSec, "NX"],
      ["TTL", redisKey],
    ]

    const res = await fetch(`${baseUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
      signal: AbortSignal.timeout(2_500),
    })

    if (!res.ok) {
      return checkRateLimit(key, limit, windowMs)
    }

    const results = (await res.json()) as { result?: number | string }[]
    const count = Number(results[0]?.result ?? 0)
    const ttl = Number(results[2]?.result ?? windowSec)

    if (count > limit) {
      return { ok: false, retryAfterSec: Math.max(1, ttl) }
    }

    return { ok: true }
  } catch {
    return checkRateLimit(key, limit, windowMs)
  }
}

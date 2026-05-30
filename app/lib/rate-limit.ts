type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Límite simple por instancia (serverless). Suficiente para abuso básico. */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

export function clientIp(request: Request): string {
  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.trim()
  if (vercelIp) return vercelIp.split(",")[0]?.trim() || "unknown"

  const realIp = request.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp

  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1] ?? "unknown"
  }

  return "unknown"
}

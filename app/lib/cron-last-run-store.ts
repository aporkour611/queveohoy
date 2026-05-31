const REDIS_KEY = "qvh:cron:last"
const TTL_SEC = 60 * 60 * 24 * 30

async function upstashCommand(command: (string | number)[]): Promise<unknown> {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!baseUrl || !token) return null

  const res = await fetch(`${baseUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(5_000),
  })

  if (!res.ok) return null
  const json = (await res.json()) as { result?: unknown }
  return json.result ?? null
}

export function isCronLastRunStoreConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  )
}

export async function saveLastCronRun(payload: unknown): Promise<boolean> {
  if (!isCronLastRunStoreConfigured()) return false

  const value = JSON.stringify({
    savedAt: new Date().toISOString(),
    result: payload,
  })

  const result = await upstashCommand(["SET", REDIS_KEY, value, "EX", TTL_SEC])
  return result === "OK"
}

export async function loadLastCronRun(): Promise<{
  savedAt: string
  result: unknown
} | null> {
  if (!isCronLastRunStoreConfigured()) return null

  const raw = await upstashCommand(["GET", REDIS_KEY])
  if (typeof raw !== "string" || !raw) return null

  try {
    const parsed = JSON.parse(raw) as { savedAt?: string; result?: unknown }
    if (!parsed.savedAt || parsed.result == null) return null
    return { savedAt: parsed.savedAt, result: parsed.result }
  } catch {
    return null
  }
}

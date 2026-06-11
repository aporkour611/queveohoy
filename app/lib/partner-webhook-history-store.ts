import type {
  PartnerFeedWebhookPayload,
  PartnerWebhookDelivery,
  PartnerWebhookNotifyResult,
} from "./partner-webhooks"

const REDIS_KEY = "qvh:webhook:history"
const TTL_SEC = 60 * 60 * 24 * 30
const MAX_ENTRIES = 40

export type PartnerWebhookHistoryEntry = {
  at: string
  event: PartnerFeedWebhookPayload["event"]
  generatedAt: string
  date: string
  eventCount: number
  version: string
  configured: number
  sent: number
  failed: number
  deliveries: PartnerWebhookDelivery[]
}

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

export function isPartnerWebhookHistoryStoreConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  )
}

export function buildWebhookHistoryEntry(
  payload: PartnerFeedWebhookPayload,
  result: PartnerWebhookNotifyResult
): PartnerWebhookHistoryEntry {
  return {
    at: new Date().toISOString(),
    event: payload.event,
    generatedAt: payload.generatedAt,
    date: payload.date,
    eventCount: payload.eventCount,
    version: payload.version,
    configured: result.configured,
    sent: result.sent,
    failed: result.failed,
    deliveries: result.deliveries,
  }
}

export async function appendPartnerWebhookHistory(
  payload: PartnerFeedWebhookPayload,
  result: PartnerWebhookNotifyResult
): Promise<boolean> {
  if (!isPartnerWebhookHistoryStoreConfigured()) return false
  if (result.configured === 0) return false

  const entry = buildWebhookHistoryEntry(payload, result)
  const value = JSON.stringify(entry)

  const pushed = await upstashCommand(["LPUSH", REDIS_KEY, value])
  if (pushed == null) return false

  await upstashCommand(["LTRIM", REDIS_KEY, 0, MAX_ENTRIES - 1])
  await upstashCommand(["EXPIRE", REDIS_KEY, TTL_SEC])
  return true
}

export async function loadPartnerWebhookHistory(
  limit = 20
): Promise<PartnerWebhookHistoryEntry[]> {
  if (!isPartnerWebhookHistoryStoreConfigured()) return []

  const safeLimit = Math.min(Math.max(1, limit), MAX_ENTRIES)
  const raw = await upstashCommand(["LRANGE", REDIS_KEY, 0, safeLimit - 1])
  if (!Array.isArray(raw)) return []

  const entries: PartnerWebhookHistoryEntry[] = []
  for (const item of raw) {
    if (typeof item !== "string" || !item) continue
    try {
      const parsed = JSON.parse(item) as PartnerWebhookHistoryEntry
      if (parsed.at && parsed.event && Array.isArray(parsed.deliveries)) {
        entries.push(parsed)
      }
    } catch {
      /* skip corrupt row */
    }
  }
  return entries
}

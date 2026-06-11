import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  appendPartnerWebhookHistory,
  buildWebhookHistoryEntry,
  loadPartnerWebhookHistory,
} from "./partner-webhook-history-store"
import type { PartnerWebhookNotifyResult } from "./partner-webhooks"

describe("partner-webhook-history-store", () => {
  const originalFetch = global.fetch
  const url = "https://upstash.example"
  const token = "token-test"

  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = url
    process.env.UPSTASH_REDIS_REST_TOKEN = token
    global.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body)) as (string | number)[]
      const cmd = body[0]
      if (cmd === "LPUSH") return new Response(JSON.stringify({ result: 1 }))
      if (cmd === "LTRIM") return new Response(JSON.stringify({ result: "OK" }))
      if (cmd === "EXPIRE") return new Response(JSON.stringify({ result: 1 }))
      if (cmd === "LRANGE") {
        return new Response(
          JSON.stringify({
            result: [
              JSON.stringify(
                buildWebhookHistoryEntry(
                  {
                    event: "feed.updated",
                    generatedAt: "2026-05-31T10:00:00.000Z",
                    date: "2026-05-31",
                    eventCount: 5,
                    version: "2.5.0",
                  },
                  {
                    configured: 1,
                    sent: 1,
                    failed: 0,
                    deliveries: [{ partnerId: "demo", ok: true, status: 200 }],
                  }
                )
              ),
            ],
          })
        )
      }
      return new Response(JSON.stringify({ result: null }))
    }) as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  })

  it("buildWebhookHistoryEntry incluye entregas", () => {
    const result: PartnerWebhookNotifyResult = {
      configured: 1,
      sent: 0,
      failed: 1,
      deliveries: [{ partnerId: "x", ok: false, error: "timeout" }],
    }
    const entry = buildWebhookHistoryEntry(
      {
        event: "feed.updated",
        generatedAt: "t",
        date: "2026-05-31",
        eventCount: 1,
        version: "2.5.0",
      },
      result
    )
    expect(entry.deliveries[0]?.error).toBe("timeout")
    expect(entry.failed).toBe(1)
  })

  it("append y load usan LPUSH/LRANGE", async () => {
    const ok = await appendPartnerWebhookHistory(
      {
        event: "feed.updated",
        generatedAt: "2026-05-31T10:00:00.000Z",
        date: "2026-05-31",
        eventCount: 10,
        version: "2.5.0",
      },
      {
        configured: 1,
        sent: 1,
        failed: 0,
        deliveries: [{ partnerId: "p1", ok: true, status: 200 }],
      }
    )
    expect(ok).toBe(true)

    const entries = await loadPartnerWebhookHistory(5)
    expect(entries).toHaveLength(1)
    expect(entries[0]?.deliveries[0]?.partnerId).toBe("demo")
  })

  it("append devuelve false si no hay partners configurados", async () => {
    const ok = await appendPartnerWebhookHistory(
      {
        event: "feed.updated",
        generatedAt: "t",
        date: "d",
        eventCount: 0,
        version: "2.5.0",
      },
      { configured: 0, sent: 0, failed: 0, deliveries: [] }
    )
    expect(ok).toBe(false)
  })
})

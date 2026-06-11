import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { resetPartnerApiKeyCacheForTests } from "./partner-api"
import {
  deliverPartnerWebhook,
  notifyPartnerFeedWebhooks,
} from "./partner-webhooks"

describe("deliverPartnerWebhook", () => {
  const payload = {
    event: "feed.updated" as const,
    generatedAt: "2026-05-31T12:00:00.000Z",
    date: "2026-05-31",
    eventCount: 120,
    version: "2.7.0",
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("reintenta en 5xx y acaba en ok", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("fail", { status: 503 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }))

    const promise = deliverPartnerWebhook(
      "https://hooks.example.com/qvh",
      "demo",
      "secret",
      JSON.stringify(payload),
      payload.event,
      fetchImpl as typeof fetch
    )

    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.ok).toBe(true)
    expect(result.attempts).toBe(2)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it("no reintenta en 4xx salvo 429", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("bad", { status: 400 })
    ) as typeof fetch

    const result = await deliverPartnerWebhook(
      "https://hooks.example.com/qvh",
      "demo",
      "secret",
      JSON.stringify(payload),
      payload.event,
      fetchImpl
    )

    expect(result.ok).toBe(false)
    expect(result.attempts).toBe(1)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})

describe("notifyPartnerFeedWebhooks", () => {
  const prev = process.env.PARTNER_API_KEYS
  const originalFetch = global.fetch

  beforeEach(() => {
    resetPartnerApiKeyCacheForTests()
    process.env.PARTNER_API_KEYS =
      "sec-1:DemoPartner|https://hooks.example.com/qvh"
    global.fetch = vi.fn(async () => new Response("ok", { status: 200 })) as typeof fetch
  })

  afterEach(() => {
    resetPartnerApiKeyCacheForTests()
    global.fetch = originalFetch
    if (prev) process.env.PARTNER_API_KEYS = prev
    else delete process.env.PARTNER_API_KEYS
  })

  it("POSTs signed payload to configured webhooks", async () => {
    const result = await notifyPartnerFeedWebhooks({
      event: "feed.updated",
      generatedAt: "2026-05-31T12:00:00.000Z",
      date: "2026-05-31",
      eventCount: 120,
      version: "2.3.0",
    })

    expect(result.configured).toBe(1)
    expect(result.sent).toBe(1)
    expect(result.deliveries[0]?.attempts).toBe(1)
    expect(global.fetch).toHaveBeenCalledWith(
      "https://hooks.example.com/qvh",
      expect.objectContaining({ method: "POST" })
    )
  })
})

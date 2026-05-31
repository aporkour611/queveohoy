import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { resetPartnerApiKeyCacheForTests } from "./partner-api"
import { notifyPartnerFeedWebhooks } from "./partner-webhooks"

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
    expect(global.fetch).toHaveBeenCalledWith(
      "https://hooks.example.com/qvh",
      expect.objectContaining({ method: "POST" })
    )
  })
})

import { describe, expect, it, beforeEach, afterEach } from "vitest"
import {
  isPartnerApiConfigured,
  resolvePartnerApiKey,
  resetPartnerApiKeyCacheForTests,
} from "./partner-api"

describe("partner-api", () => {
  const prev = process.env.PARTNER_API_KEYS

  beforeEach(() => {
    resetPartnerApiKeyCacheForTests()
    process.env.PARTNER_API_KEYS = "secret-abc:Mediaset,secret-def:AppFoo"
  })

  afterEach(() => {
    resetPartnerApiKeyCacheForTests()
    if (prev) process.env.PARTNER_API_KEYS = prev
    else delete process.env.PARTNER_API_KEYS
  })

  it("resolves partner from X-API-Key", () => {
    const req = new Request("https://queveohoy.es/api/v2/feed", {
      headers: { "X-API-Key": "secret-abc" },
    })
    expect(resolvePartnerApiKey(req)).toEqual({
      id: "mediaset",
      label: "Mediaset",
    })
  })

  it("returns null for unknown key", () => {
    const req = new Request("https://queveohoy.es/api/v2/feed", {
      headers: { "X-API-Key": "wrong" },
    })
    expect(resolvePartnerApiKey(req)).toBeNull()
  })

  it("detects configuration", () => {
    expect(isPartnerApiConfigured()).toBe(true)
  })
})

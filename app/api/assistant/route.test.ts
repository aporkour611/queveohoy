import { describe, expect, it, vi } from "vitest"
import { GET, POST } from "./route"

vi.mock("@/app/lib/assistant-feed-cache", () => ({
  getAssistantFeedSnapshot: vi.fn(async () => ({
    events: [],
    error: null,
  })),
}))

vi.mock("@/app/lib/api-rate-limit", () => ({
  enforceApiRateLimit: vi.fn(async () => ({ ok: true as const })),
}))

describe("POST /api/assistant", () => {
  it("GET responde 405", async () => {
    const res = await GET()
    expect(res.status).toBe(405)
  })

  it("POST responde 410 cuando el asistente está desactivado", async () => {
    const prev = process.env.ASSISTANT_ENABLED
    delete process.env.ASSISTANT_ENABLED

    const req = new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "fútbol hoy" }),
    })

    const res = await POST(req as import("next/server").NextRequest)
    expect(res.status).toBe(410)

    if (prev) process.env.ASSISTANT_ENABLED = prev
  })

  it("POST responde 401 sin API key cuando ASSISTANT_API_KEY está definido", async () => {
    const prevEnabled = process.env.ASSISTANT_ENABLED
    const prevKey = process.env.ASSISTANT_API_KEY
    process.env.ASSISTANT_ENABLED = "true"
    process.env.ASSISTANT_API_KEY = "test-secret"

    const req = new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "fútbol hoy" }),
    })

    const res = await POST(req as import("next/server").NextRequest)
    expect(res.status).toBe(401)

    if (prevEnabled) process.env.ASSISTANT_ENABLED = prevEnabled
    else delete process.env.ASSISTANT_ENABLED
    if (prevKey) process.env.ASSISTANT_API_KEY = prevKey
    else delete process.env.ASSISTANT_API_KEY
  })
})

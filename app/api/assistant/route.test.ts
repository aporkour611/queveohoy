import { describe, expect, it, vi } from "vitest"
import { GET, POST } from "./route"

vi.mock("@/app/lib/events-feed-server", () => ({
  fetchHomeFeedEvents: vi.fn(async () => ({
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
})

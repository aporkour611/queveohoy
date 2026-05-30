import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { GET } from "./route"

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "cron-test-secret")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("no expone integraciones sin Bearer", async () => {
    const res = await GET(new Request("http://localhost/api/health?detailed=1"))
    const body = await res.json()
    expect(body.integrations).toBeUndefined()
  })

  it("expone integraciones con Bearer CRON_SECRET", async () => {
    const res = await GET(
      new Request("http://localhost/api/health", {
        headers: { Authorization: "Bearer cron-test-secret" },
      })
    )
    const body = await res.json()
    expect(body.integrations).toBeTruthy()
  })
})

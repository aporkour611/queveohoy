import { describe, expect, it } from "vitest"
import { buildCronMetricsSummary } from "./cron-metrics"

describe("buildCronMetricsSummary", () => {
  it("sums ingest counts and flags football warning", () => {
    const summary = buildCronMetricsSummary({
      ok: true,
      timestamp: "2026-05-31T12:00:00.000Z",
      football: { count: 12, errors: [] },
      esports: 3,
      f1: 1,
      feedCache: { ok: true },
    })

    expect(summary.totalIngested).toBe(16)
    expect(summary.rows.find((r) => r.id === "football")?.status).toBe("ok")
  })

  it("handles null payload", () => {
    const summary = buildCronMetricsSummary(null)
    expect(summary.ok).toBe(false)
    expect(summary.rows[0]?.status).toBe("warn")
  })
})

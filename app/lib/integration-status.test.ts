import { describe, expect, it } from "vitest"
import {
  getIntegrationStatus,
  integrationScore,
} from "./integration-status"

describe("integration-status", () => {
  it("returns boolean flags only", () => {
    const status = getIntegrationStatus()
    for (const value of Object.values(status)) {
      expect(typeof value).toBe("boolean")
    }
  })

  it("computes score buckets", () => {
    const score = integrationScore(getIntegrationStatus())
    expect(score.requiredTotal).toBe(7)
    expect(score.optionalTotal).toBe(7)
  })
})

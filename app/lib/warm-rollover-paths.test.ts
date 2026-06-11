import { describe, expect, it } from "vitest"
import { KEEP_WARM_ORIGIN_PATHS } from "./keep-warm"
import { ROLLOVER_PATHS } from "./revalidate-feed"

describe("warm and rollover path alignment", () => {
  it("shares SEO hub paths between keep-warm and rollover", () => {
    for (const hubPath of ["/futbol", "/champions"] as const) {
      expect(KEEP_WARM_ORIGIN_PATHS).toContain(hubPath)
      expect(ROLLOVER_PATHS).toContain(hubPath)
    }
  })
})

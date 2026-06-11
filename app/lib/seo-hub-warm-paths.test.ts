import { describe, expect, it } from "vitest"
import { KEEP_WARM_ORIGIN_PATHS } from "./keep-warm"
import { PRIORITY_SEO_HUB_PATHS } from "./seo-hub-warm-paths"
import { ROLLOVER_PATHS } from "./revalidate-feed"

describe("PRIORITY_SEO_HUB_PATHS", () => {
  it("lists five high-traffic SEO hubs", () => {
    expect(PRIORITY_SEO_HUB_PATHS).toHaveLength(5)
    expect(PRIORITY_SEO_HUB_PATHS).toContain("/futbol")
    expect(PRIORITY_SEO_HUB_PATHS).toContain("/premier-league")
  })

  it("is included in keep-warm and rollover paths", () => {
    for (const hubPath of PRIORITY_SEO_HUB_PATHS) {
      expect(KEEP_WARM_ORIGIN_PATHS).toContain(hubPath)
      expect(ROLLOVER_PATHS).toContain(hubPath)
    }
  })
})

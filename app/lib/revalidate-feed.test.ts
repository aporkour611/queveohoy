import { describe, expect, it } from "vitest"
import { ROLLOVER_PATHS } from "./revalidate-feed"

describe("ROLLOVER_PATHS", () => {
  it("includes hubs SEO and API week on midnight rollover", () => {
    expect(ROLLOVER_PATHS).toContain("/futbol")
    expect(ROLLOVER_PATHS).toContain("/champions")
    expect(ROLLOVER_PATHS).toContain("/laliga")
    expect(ROLLOVER_PATHS).toContain("/api/v1/feed/week")
    expect(ROLLOVER_PATHS).toContain("/formula-1")
    expect(ROLLOVER_PATHS).toContain("/premier-league")
    expect(ROLLOVER_PATHS).toContain("/api/feed-meta")
  })
})

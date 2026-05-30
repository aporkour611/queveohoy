import { describe, expect, it } from "vitest"
import { buildFeedEtag } from "./feed-etag"

describe("buildFeedEtag", () => {
  it("returns quoted etag string", () => {
    const etag = buildFeedEtag([
      { id: "a", date: "2026-05-30" },
      { id: "b", date: "2026-05-31" },
    ])
    expect(etag).toMatch(/^".+"$/)
    expect(buildFeedEtag([
      { id: "a", date: "2026-05-30" },
      { id: "b", date: "2026-05-31" },
    ])).toBe(etag)
  })
})

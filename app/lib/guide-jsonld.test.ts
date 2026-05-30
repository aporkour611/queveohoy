import { describe, expect, it } from "vitest"
import { buildGuideJsonLd } from "./guide-jsonld"
import { SEO_GUIDES } from "./seo-guides"

describe("guide-jsonld", () => {
  it("builds Article and BreadcrumbList for guides", () => {
    const guide = SEO_GUIDES[0]
    const data = buildGuideJsonLd(guide)
    const types = (data["@graph"] as { "@type": string }[]).map((n) => n["@type"])
    expect(types).toContain("Article")
    expect(types).toContain("BreadcrumbList")
  })
})

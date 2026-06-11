import { describe, expect, it } from "vitest"
import { buildStaticSitemapEntries } from "./sitemap-entries"
import { SEO_HUBS } from "./seo-hubs"
import { siteUrl } from "./seo"

describe("buildStaticSitemapEntries", () => {
  it("includes home, explorar, hubs and desarrolladores", () => {
    const now = new Date("2026-06-11T12:00:00.000Z")
    const entries = buildStaticSitemapEntries(now)
    const urls = entries.map((entry) => entry.url)

    expect(urls).toContain(siteUrl)
    expect(urls).toContain(`${siteUrl}/explorar`)
    expect(urls).toContain(`${siteUrl}/desarrolladores`)

    for (const hub of SEO_HUBS) {
      expect(urls).toContain(`${siteUrl}/${hub.slug}`)
    }
  })
})

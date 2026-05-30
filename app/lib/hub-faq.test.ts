import { describe, expect, it } from "vitest"
import { SEO_HUB_SLUGS } from "./seo-hubs"
import { getHubFaqItems } from "./seo-jsonld"

describe("hub FAQ schema", () => {
  it("incluye FAQ para todos los hubs SEO", () => {
    for (const slug of SEO_HUB_SLUGS) {
      expect(getHubFaqItems(slug).length).toBeGreaterThanOrEqual(2)
    }
  })

  it("devuelve vacío para slug desconocido", () => {
    expect(getHubFaqItems("no-existe")).toEqual([])
  })
})

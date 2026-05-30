import { describe, expect, it } from "vitest"
import { getHubFaqItems } from "./seo-jsonld"

describe("hub FAQ schema", () => {
  it("incluye FAQ para hubs de alto tráfico", () => {
    for (const slug of [
      "partidos-hoy",
      "futbol",
      "champions",
      "laliga",
      "formula-1",
    ]) {
      expect(getHubFaqItems(slug).length).toBeGreaterThanOrEqual(2)
    }
  })

  it("devuelve vacío para slug desconocido", () => {
    expect(getHubFaqItems("no-existe")).toEqual([])
  })
})

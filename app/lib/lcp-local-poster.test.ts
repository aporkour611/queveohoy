import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { existsSync } from "node:fs"

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
}))

import { resolveLcpLocalRasterUrl } from "./lcp-local-poster"

describe("resolveLcpLocalRasterUrl", () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("prefiere webp gemelo en /posters/", () => {
    vi.mocked(existsSync).mockReturnValue(true)
    expect(resolveLcpLocalRasterUrl("/posters/gran-hermano.png")).toBe(
      "/posters/gran-hermano.webp"
    )
  })

  it("mantiene png si no hay webp", () => {
    vi.mocked(existsSync).mockReturnValue(false)
    expect(resolveLcpLocalRasterUrl("/posters/gran-hermano.png")).toBe(
      "/posters/gran-hermano.png"
    )
  })

  it("no altera rutas fuera de posters", () => {
    expect(resolveLcpLocalRasterUrl("/deportes/f1.png")).toBe("/deportes/f1.png")
  })
})

import { describe, expect, it } from "vitest"
import { parseTmdbPoster } from "./tmdb-client"

describe("parseTmdbPoster sizes", () => {
  const path = "tmdb:poster:/abc.jpg"

  it("uses w185 for card feed posters", () => {
    expect(parseTmdbPoster(path, "card")).toBe(
      "https://image.tmdb.org/t/p/w185/abc.jpg"
    )
  })

  it("uses w342 for spotlight poster variant", () => {
    expect(parseTmdbPoster(path, "poster")).toBe(
      "https://image.tmdb.org/t/p/w342/abc.jpg"
    )
  })

  it("uses w92 for thumbs", () => {
    expect(parseTmdbPoster(path, "thumb")).toBe(
      "https://image.tmdb.org/t/p/w92/abc.jpg"
    )
  })
})

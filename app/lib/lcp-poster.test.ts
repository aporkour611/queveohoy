import { describe, expect, it } from "vitest"
import {
  buildLcpPosterUrl,
  LCP_TMDB_POSTER_WIDTH,
  resolveLcpCoverImgSrc,
} from "./lcp-poster"

describe("buildLcpPosterUrl", () => {
  it("uses w154 for TMDB LCP", () => {
    const url = buildLcpPosterUrl(
      "https://image.tmdb.org/t/p/w342/abc.jpg"
    )
    expect(url).toBe(`https://image.tmdb.org/t/p/${LCP_TMDB_POSTER_WIDTH}/abc.jpg`)
  })
})

describe("resolveLcpCoverImgSrc", () => {
  it("usa TMDB w92 directo para remoto no local", () => {
    const tmdb = "https://image.tmdb.org/t/p/w342/abc.jpg"
    expect(resolveLcpCoverImgSrc(tmdb, false)).toBe(
      `https://image.tmdb.org/t/p/${LCP_TMDB_POSTER_WIDTH}/abc.jpg`
    )
  })
})

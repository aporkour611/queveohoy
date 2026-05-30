import { describe, expect, it } from "vitest";
import { buildLcpPosterUrl, isTmdbPosterUrl } from "./lcp-poster";

describe("lcp-poster", () => {
  it("normalizes TMDB poster to w185", () => {
    const url = buildLcpPosterUrl(
      "https://image.tmdb.org/t/p/w500/example.jpg"
    );
    expect(url).toBe("https://image.tmdb.org/t/p/w185/example.jpg");
  });

  it("detects TMDB hosts", () => {
    expect(isTmdbPosterUrl("https://image.tmdb.org/t/p/w500/x.jpg")).toBe(true);
    expect(isTmdbPosterUrl("/local/poster.png")).toBe(false);
  });
});

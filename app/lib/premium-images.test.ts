import { describe, expect, it } from "vitest";
import {
  resolvePrioritySpotlightSrc,
  POSTER_BLUR_DATA_URL,
} from "./premium-images";

describe("resolvePrioritySpotlightSrc", () => {
  it("usa TMDB w92 directo para LCP", () => {
    const result = resolvePrioritySpotlightSrc(
      "https://image.tmdb.org/t/p/w500/abc123.jpg"
    );
    expect(result?.mode).toBe("lcp-direct");
    expect(result?.src).toContain("/w92/");
  });

  it("usa next-image para posters locales", () => {
    const result = resolvePrioritySpotlightSrc("/flagship/roland-garros.png");
    expect(result?.mode).toBe("next-image");
  });

  it("expone blur placeholder ligero", () => {
    expect(POSTER_BLUR_DATA_URL.startsWith("data:image/svg+xml")).toBe(true);
  });
});

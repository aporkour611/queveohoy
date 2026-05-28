import { describe, expect, it } from "vitest";
import {
  buildOptimizedPreloadHref,
  canOptimizeImageSrc,
} from "./optimized-image";

describe("optimized-image", () => {
  it("allows TMDB remotes", () => {
    expect(
      canOptimizeImageSrc("https://image.tmdb.org/t/p/w342/abc.jpg")
    ).toBe(true);
  });

  it("rejects unknown hosts", () => {
    expect(canOptimizeImageSrc("https://evil.example/x.jpg")).toBe(false);
  });

  it("builds /_next/image preload for TMDB", () => {
    const href = buildOptimizedPreloadHref(
      "https://image.tmdb.org/t/p/w342/abc.jpg"
    );
    expect(href).toContain("/_next/image");
    expect(href).toContain("image.tmdb.org");
  });
});

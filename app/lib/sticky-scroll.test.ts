import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SPANISH_TV_FLAGSHIP } from "./spanish-tv-curated";

describe("editorial TV posters", () => {
  it("asigna portada local a los programas flagship nuevos", () => {
    const withPoster = SPANISH_TV_FLAGSHIP.filter(
      (show) => show.localPosterPath || show.posterPath
    );

    expect(withPoster.length).toBeGreaterThanOrEqual(SPANISH_TV_FLAGSHIP.length - 1);
  });

  it("las portadas SVG generadas existen en /public/posters", () => {
    const posterRoot = join(process.cwd(), "public", "posters");

    for (const show of SPANISH_TV_FLAGSHIP) {
      if (!show.localPosterPath?.endsWith(".svg")) continue;
      const filePath = join(posterRoot, show.localPosterPath.replace("/posters/", ""));
      expect(readFileSync(filePath, "utf8")).toContain("<svg");
    }
  });
});

describe("sticky scroll surfaces", () => {
  it("no usa backdrop-filter en calendario", () => {
    const brandCss = readFileSync(join(process.cwd(), "app", "brand.css"), "utf8");
    const feedControlsBlock = brandCss.slice(
      brandCss.indexOf(".qvh-feed-controls {"),
      brandCss.indexOf(".qvh-feed-day-placeholder")
    );

    expect(feedControlsBlock).not.toContain("backdrop-filter");
  });

  it("solo el cartel del día es sticky bajo la navbar", () => {
    const brandCss = readFileSync(join(process.cwd(), "app", "brand.css"), "utf8");
    const shellCss = readFileSync(
      join(process.cwd(), "app", "futbolhoy-shell.css"),
      "utf8"
    );
    const feedControlsBlock = brandCss.slice(
      brandCss.indexOf(".qvh-feed-controls {"),
      brandCss.indexOf(".qvh-feed-day-placeholder")
    );
    const matchdayStart = shellCss.indexOf(".fh-matchday-header {");
    const matchdayBlock = shellCss.slice(matchdayStart, matchdayStart + 420);

    expect(feedControlsBlock).not.toMatch(/position:\s*sticky/);
    expect(matchdayBlock).toContain("position: sticky");
    expect(matchdayBlock).toContain("top: var(--qvh-navbar-h)");
    expect(matchdayBlock).not.toContain("--qvh-feed-controls-h");
  });

  it("no mantiene capa ambient fija con blur en el shell", () => {
    const shellCss = readFileSync(
      join(process.cwd(), "app", "futbolhoy-shell.css"),
      "utf8"
    );

    expect(shellCss).not.toContain("filter: blur(48px)");
    expect(shellCss).not.toContain(".fh-header-ambient-wash");
  });
});

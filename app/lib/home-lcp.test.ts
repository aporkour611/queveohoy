import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { getDestacadoImportanceTier } from "./destacados-importance";
import { getSpotlightCardModel } from "./featured-card";
import { buildOptimizedPreloadHref } from "./optimized-image";
import { resolveHomeLcpPreloadEntries } from "./home-lcp";
import { MADRID_TZ } from "./timezone";

const maskSingerEvent: EventRow = {
  id: 9001,
  title: "Mask Singer",
  sport: "tv",
  date: "2026-05-27",
  time: "23:00",
  competition: "Concurso · Mask Singer",
  platform: "Antena 3 · ATRESPLAYER TV",
};

describe("resolveHomeLcpPreloadEntries", () => {
  it("resolves mask singer editorial poster on spotlight card", () => {
    const cover = getSpotlightCardModel(maskSingerEvent, MADRID_TZ).coverImage;

    expect(cover?.local).toBe(false);
    expect(cover?.url).toContain("image.tmdb.org");
  });

  it("builds optimized preload href for TMDB mask singer poster", () => {
    const cover = getSpotlightCardModel(maskSingerEvent, MADRID_TZ).coverImage!;

    expect(buildOptimizedPreloadHref(cover.url)).toContain("image.tmdb.org");
  });

  it("clasifica Mask Singer en la categoría rest de destacados", () => {
    expect(getDestacadoImportanceTier(maskSingerEvent)).toBe("rest");
  });

  it("returns a single preload entry for the first visible destacado cover", () => {
    const todayKey = "2026-05-27";
    const entries = resolveHomeLcpPreloadEntries([], todayKey);

    expect(entries.length).toBe(1);
    expect(entries.every((entry) => entry.href.includes("/_next/image"))).toBe(
      true
    );
  });
});

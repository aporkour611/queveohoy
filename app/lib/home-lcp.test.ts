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

  it("preloads TMDB poster directo w92 (sin /_next/image)", () => {
    const cover = getSpotlightCardModel(maskSingerEvent, MADRID_TZ).coverImage!;
    const entries = resolveHomeLcpPreloadEntries([maskSingerEvent], "2026-05-27");

    expect(entries[0]?.href).toContain("image.tmdb.org/t/p/w92/");
    expect(entries[0]?.href).not.toContain("/_next/image");
    expect(buildOptimizedPreloadHref(cover.url)).toContain("/_next/image");
  });

  it("prefiere poster local mismo origen sobre TMDB para LCP", () => {
    const localTv: EventRow = {
      id: 9002,
      title: "Gran Hermano",
      sport: "tv",
      date: "2026-05-27",
      time: "22:00",
      competition: "Reality",
      platform: "Telecinco",
      source: "editorial",
    };
    const entries = resolveHomeLcpPreloadEntries(
      [maskSingerEvent, localTv],
      "2026-05-27"
    );

    const cover = getSpotlightCardModel(localTv, MADRID_TZ).coverImage;
    if (cover?.local && cover.url.startsWith("/")) {
      expect(entries[0]?.href).toBe(cover.url);
      expect(entries[0]?.href).not.toContain("image.tmdb.org");
    }
  });

  it("clasifica Mask Singer en la categoría rest de destacados", () => {
    expect(getDestacadoImportanceTier(maskSingerEvent)).toBe("rest");
  });

  it("returns preload entry for visible destacado covers", () => {
    const todayKey = "2026-05-27";
    const entries = resolveHomeLcpPreloadEntries([], todayKey);

    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries[0]?.href.length).toBeGreaterThan(0);
  });
});

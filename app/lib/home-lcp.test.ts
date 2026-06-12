import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { getDestacadoImportanceTier } from "./destacados-importance";
import { getSpotlightCardModel } from "./featured-card";
import { buildOptimizedPreloadHref } from "./optimized-image";
import { resolveHomeLcpPreloadEntries, resolveLcpPreloadEntryFromCover } from "./home-lcp";
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

    expect(cover?.local).toBe(true);
    expect(cover?.url).toBe("/posters/mask-singer.png");
  });

  it("preloads poster local raster para LCP (sin /_next/image)", () => {
    const cover = getSpotlightCardModel(maskSingerEvent, MADRID_TZ).coverImage!;
    const entry = resolveLcpPreloadEntryFromCover(cover);

    expect(entry?.href).toBe("/posters/mask-singer.webp");
    expect(entry?.href).not.toContain("/_next/image");
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
    const cover = getSpotlightCardModel(localTv, MADRID_TZ).coverImage!;
    const entry = resolveLcpPreloadEntryFromCover(cover);

    expect(cover.local).toBe(true);
    expect(entry?.href).toBe("/posters/gran-hermano.webp");
    expect(entry?.href).not.toContain("image.tmdb.org");
  });

  it("elige pasapalabra local como LCP cuando está en destacados curados", () => {
    const entries = resolveHomeLcpPreloadEntries([maskSingerEvent], "2026-05-27");

    expect(entries[0]?.href).toBe("/posters/pasapalabra.webp");
  });

  it("precarga retrato LCP UFC en ventana Casablanca", () => {
    const entries = resolveHomeLcpPreloadEntries([], "2026-06-10");

    expect(entries.length).toBe(1);
    expect(entries[0]?.href).toContain("/deportes/ufc/topuria-lcp.webp");
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

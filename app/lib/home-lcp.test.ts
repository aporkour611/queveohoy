import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { DESTACADOS_VISIBLE_SLOTS, pickWeekDestacados } from "./destacados-config";
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

    expect(cover?.local).toBe(true);
    expect(cover?.url).toContain("/posters/mask-singer.png");
  });

  it("builds optimized preload href for mask singer poster", () => {
    const cover = getSpotlightCardModel(maskSingerEvent, MADRID_TZ).coverImage!;

    expect(buildOptimizedPreloadHref(cover.url)).toContain("mask-singer");
    expect(buildOptimizedPreloadHref(cover.url)).toContain("/_next/image");
  });

  it("includes mask singer in week destacados", () => {
    const week = pickWeekDestacados([maskSingerEvent], { todayKey: "2026-05-27" });

    expect(week.some((event) => /mask singer/i.test(event.title ?? ""))).toBe(
      true
    );
  });

  it("returns preload entries for visible destacados covers", () => {
    const todayKey = "2026-05-27";
    const entries = resolveHomeLcpPreloadEntries([], todayKey);

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.length).toBeLessThanOrEqual(DESTACADOS_VISIBLE_SLOTS);
    expect(entries.every((entry) => entry.href.includes("/_next/image"))).toBe(
      true
    );
  });
});

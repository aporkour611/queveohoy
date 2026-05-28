import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { pickWeekDestacados } from "./destacados-config";
import { getSpotlightCardModel } from "./featured-card";
import { buildOptimizedPreloadHref } from "./optimized-image";
import { resolveHomeLcpPreloadEntries } from "./home-lcp";
import { MADRID_TZ } from "./timezone";

const maskSingerEvent: EventRow = {
  id: 9001,
  title: "Mask Singer",
  sport: "tv",
  date: "2026-05-28",
  time: "23:00",
  competition: "Concurso · Mask Singer",
  platform: "Antena 3 · ATRESPLAYER TV",
};

describe("resolveHomeLcpPreloadEntries", () => {
  const testTimeoutMs = 20_000;
  it("preloads local spotlight posters via /_next/image", { timeout: testTimeoutMs }, () => {
    const entries = resolveHomeLcpPreloadEntries([maskSingerEvent]);

    expect(entries.some((entry) => entry.href.includes("posters"))).toBe(true);
    expect(entries.every((entry) => entry.href.includes("/_next/image"))).toBe(true);
  });

  it("matches visible week destacado covers", { timeout: testTimeoutMs }, () => {
    const featured = pickWeekDestacados([maskSingerEvent], {
      todayKey: "2026-05-28",
    });
    const cover = getSpotlightCardModel(featured[0], MADRID_TZ).coverImage;

    expect(cover?.local).toBe(true);
    expect(cover?.url).toContain("/posters/mask-singer.png");
    expect(resolveHomeLcpPreloadEntries([maskSingerEvent])[0]?.href).toBe(
      buildOptimizedPreloadHref(cover!.url)
    );
  });
});

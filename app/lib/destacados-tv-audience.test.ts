import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { pickTodayDestacados } from "./destacados-config";
import { isSpanishTvDestacadosEligible } from "./spanish-tv-curated";

function tvEvent(title: string, priority: number, date = "2026-05-30"): EventRow {
  return {
    id: priority,
    external_id: `curated_tv_test_${priority}_${date}`,
    title,
    date,
    time: "22:00",
    sport: "tv",
    competition: `Talk show · ${title}`,
    platform: "La 2 · RTVE Play",
    source: `manual|curated:test|buzz:${priority}`,
  };
}

describe("isSpanishTvDestacadosEligible", () => {
  it("allows high-audience shows and blocks lower-audience talk shows", () => {
    expect(isSpanishTvDestacadosEligible(tvEvent("El Hormiguero", 99))).toBe(true);
    expect(isSpanishTvDestacadosEligible(tvEvent("Late Xou", 88))).toBe(false);
  });
});

describe("pickTodayDestacados TV audience", () => {
  it("keeps Late Xou out of destacados but Hormiguero stays", () => {
    const pool = [
      tvEvent("El Hormiguero", 99),
      tvEvent("Late Xou", 88),
      {
        id: 50,
        external_id: "tmdb_tv_reality_1_2026-05-30_s1e1",
        title: "Final Champions",
        date: "2026-05-30",
        time: "21:00",
        sport: "futbol",
        competition: "Champions League · Final",
        platform: "Movistar",
        home_team: "PSG",
        away_team: "Arsenal",
      },
    ];

    const picked = pickTodayDestacados(pool, { todayKey: "2026-05-30" });
    const titles = picked.map((event) => event.title ?? "");

    expect(titles.some((title) => /hormiguero/i.test(title))).toBe(true);
    expect(titles.some((title) => /late xou/i.test(title))).toBe(false);
  });
});

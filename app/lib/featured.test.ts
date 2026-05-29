import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import {
  pickFeaturedEvents,
  pickFilteredEvents,
  pickHomePageEvents,
} from "./featured";

function esportsEvent(id: number, sport: string, title: string): EventRow {
  return {
    id,
    title,
    date: "2026-05-28",
    time: `${10 + id}:00`,
    sport,
    home_team: `Team ${id}A`,
    away_team: `Team ${id}B`,
    competition: "VCT EMEA",
    platform: "Twitch",
    external_id: `esports_${id}`,
    source: "pandascore",
  };
}

describe("pickFilteredEvents", () => {
  it("shows all filtered events without home section caps", () => {
    const pool = Array.from({ length: 12 }, (_, index) =>
      esportsEvent(index + 1, "valorant", `Match ${index + 1}`)
    );

    const home = pickHomePageEvents(pool);
    const filtered = pickFilteredEvents(pool);

    expect(filtered.length).toBeGreaterThan(home.length);
    expect(filtered).toHaveLength(12);
  });
});

describe("pickFeaturedEvents", () => {
  it("keeps a small curated set for destacados", () => {
    const pool = [
      ...Array.from({ length: 8 }, (_, index) =>
        esportsEvent(index + 1, "valorant", `Valorant ${index + 1}`)
      ),
      esportsEvent(99, "futbol", "Final"),
    ];

    const featured = pickFeaturedEvents(pool);
    const valorantFeatured = featured.filter((event) => event.sport === "valorant");

    expect(valorantFeatured).toHaveLength(1);
    expect(featured.some((event) => event.sport === "futbol")).toBe(true);
  });
});

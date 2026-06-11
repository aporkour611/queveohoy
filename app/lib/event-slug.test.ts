import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { eventSlug, parsePartidoSlug, partidoPath, partidoSlugsForSitemap } from "./event-slug";

function event(partial: Partial<EventRow> & { id: number }): EventRow {
  return {
    title: "Real Madrid vs Barcelona",
    date: "2026-05-27",
    home_team: "Real Madrid",
    away_team: "Barcelona",
    ...partial,
  };
}

describe("event-slug", () => {
  it("genera slug estable por fecha y equipos", () => {
    const row = event({ id: 1 });
    expect(eventSlug(row)).toBe("2026-05-27-real-madrid-vs-barcelona");
    expect(partidoPath(row)).toBe(
      "/partido/2026-05-27-real-madrid-vs-barcelona"
    );
  });

  it("deduplica slugs en sitemap", () => {
    const rows = [
      event({ id: 1 }),
      event({ id: 2 }),
      event({ id: 3, title: "Atlético vs Sevilla", away_team: "Sevilla" }),
    ];

    const slugs = partidoSlugsForSitemap(rows, 10);
    expect(slugs).toHaveLength(2);
    expect(slugs[0]).toBe("2026-05-27-real-madrid-vs-barcelona");
  });

  it("parsePartidoSlug extrae fecha", () => {
    expect(
      parsePartidoSlug("2026-05-27-real-madrid-vs-barcelona")
    ).toEqual({
      date: "2026-05-27",
      labelSlug: "real-madrid-vs-barcelona",
    });
    expect(parsePartidoSlug("invalid")).toBeNull();
  });
});

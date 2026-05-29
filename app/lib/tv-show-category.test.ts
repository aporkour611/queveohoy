import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { groupEventsForDisplay } from "./event-day-group";
import {
  eventMatchesSportFilter,
  getTvShowCategory,
  isTvFictionSeriesEvent,
} from "./tv-show-category";
import { sortSeriesCatalogEvents } from "./sort-events-by-priority";

describe("tv-show-category", () => {
  it("clasifica ficción lineal como serie, no reality", () => {
    const promesa: EventRow = {
      id: 1,
      title: "La promesa — T1E120",
      sport: "tv",
      date: "2026-05-29",
      competition: "Ficción · La promesa",
      platform: "La 1 · RTVE Play",
    };

    expect(isTvFictionSeriesEvent(promesa)).toBe(true);
    expect(getTvShowCategory(promesa)).toBeNull();
    expect(eventMatchesSportFilter(promesa, "series")).toBe(true);
    expect(eventMatchesSportFilter(promesa, "tv-reality")).toBe(false);
  });

  it("mantiene realities en su categoría", () => {
    const isla: EventRow = {
      id: 2,
      title: "La Isla de las Tentaciones — T10E24",
      sport: "tv",
      date: "2026-05-29",
      competition: "Reality · La Isla de las Tentaciones",
      platform: "Telecinco · Mitele",
    };

    expect(isTvFictionSeriesEvent(isla)).toBe(false);
    expect(getTvShowCategory(isla)).toBe("reality");
    expect(eventMatchesSportFilter(isla, "tv-reality")).toBe(true);
  });

  it("agrupa ficción en series del feed", () => {
    const groups = groupEventsForDisplay([
      {
        id: 3,
        title: "Sueños de libertad — T2E10",
        sport: "tv",
        date: "2026-05-29",
        competition: "Ficción · Sueños de libertad",
      },
      {
        id: 4,
        title: "Gran Hermano — T1E5",
        sport: "tv",
        date: "2026-05-29",
        competition: "Reality · Gran Hermano",
      },
    ]);

    expect(groups.series).toHaveLength(1);
    expect(groups.tvReality).toHaveLength(1);
  });

  it("ordena series TMDB antes que telenovelas TV", () => {
    const tmdb: EventRow = {
      id: 5,
      title: "FROM — T4E6",
      sport: "series",
      date: "2026-05-29",
      source: "tmdb|buzz:120",
    };
    const linear: EventRow = {
      id: 6,
      title: "La promesa — T1E1",
      sport: "tv",
      date: "2026-05-29",
      competition: "Ficción · La promesa",
      source: "tmdb|buzz:95",
    };

    const sorted = sortSeriesCatalogEvents([linear, tmdb]);
    expect(sorted[0].id).toBe(5);
    expect(sorted[1].id).toBe(6);
  });
});

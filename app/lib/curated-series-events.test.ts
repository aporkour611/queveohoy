import { describe, expect, it } from "vitest";
import {
  pickWeekDestacados,
} from "./destacados-config";
import {
  getDestacadoImportanceTier,
  tierRank,
} from "./destacados-importance";
import {
  mergeCuratedSeriesEvents,
  shouldSuppressCuratedSeriesStaleEvent,
  stripStaleCuratedSeriesEvents,
} from "./curated-series-events";

describe("mergeCuratedSeriesEvents", () => {
  it("inserta FROM y Euphoria con estreno España (lunes de madrugada)", () => {
    const events = mergeCuratedSeriesEvents([], "2026-05-27", 7);
    const from = events.find((event) => /^from\b/i.test(event.title ?? ""));
    const euphoria = events.find((event) => /^euphoria\b/i.test(event.title ?? ""));

    expect(from).toMatchObject({
      date: "2026-06-01",
      time: "03:00",
      sport: "series",
      platform: "HBO Max",
    });
    expect(from?.source).toContain("pRtJagIxpfODzzb0T0NAvZSzErC");

    expect(euphoria).toMatchObject({
      date: "2026-06-01",
      time: "03:00",
      sport: "series",
      platform: "HBO Max",
    });
    expect(euphoria?.source).toContain("6Sdm5XwdCnspdEF8fTFx6UJrl7o");
  });

  it("elimina entradas del domingo US cuando el estreno España es el lunes", () => {
    const stale = [
      {
        id: 1,
        external_id: "tmdb_tv_124364_2026-05-31_s4e6",
        title: "FROM — T4E6: The Heart Is a Lonely Hunter",
        date: "2026-05-31",
        time: "03:00",
        sport: "series",
        competition: "Nuevo episodio",
        platform: "HBO Max",
        source: "tmdb",
      },
      {
        id: 2,
        external_id: "tmdb_tv_85552_2026-05-31_s3e8",
        title: "Euphoria — T3E8",
        date: "2026-05-31",
        time: "03:00",
        sport: "series",
        competition: "Nuevo episodio",
        platform: "HBO Max",
        source: "tmdb",
      },
    ] as const;

    expect(shouldSuppressCuratedSeriesStaleEvent(stale[0])).toBe(true);
    expect(shouldSuppressCuratedSeriesStaleEvent(stale[1])).toBe(true);

    const events = mergeCuratedSeriesEvents([...stale], "2026-05-27", 7);
    expect(events.some((event) => event.date === "2026-05-31")).toBe(false);
    expect(events.filter((event) => /^from\b/i.test(event.title ?? ""))).toHaveLength(1);
    expect(events.filter((event) => /^euphoria\b/i.test(event.title ?? ""))).toHaveLength(1);
  });
});

describe("stripStaleCuratedSeriesEvents", () => {
  it("conserva la fila con fecha España", () => {
    const kept = stripStaleCuratedSeriesEvents([
      {
        id: 10,
        external_id: "tmdb_tv_124364_2026-06-01_s4e6",
        title: "FROM — T4E6",
        date: "2026-06-01",
        time: "03:00",
        sport: "series",
        competition: "Nuevo episodio",
        platform: "HBO Max",
        source: "tmdb",
      },
    ]);

    expect(kept).toHaveLength(1);
  });
});

describe("pickWeekDestacados", () => {
  it("ordena esta semana por importancia editorial (1 por categoría)", () => {
    const week = pickWeekDestacados([], {
      todayKey: "2026-05-27",
      windowDays: 7,
    });

    const tiers = week.map((event) => getDestacadoImportanceTier(event));
    for (let i = 1; i < tiers.length; i++) {
      expect(tierRank(tiers[i])).toBeGreaterThanOrEqual(tierRank(tiers[i - 1]));
    }

    const seriesCount = week.filter((event) => event.sport === "series").length;
    expect(seriesCount).toBeLessThanOrEqual(1);
  });
});

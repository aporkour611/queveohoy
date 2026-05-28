import { describe, expect, it } from "vitest";
import {
  extractSpainTheatricalReleaseDate,
  inferSpainStreamingBrand,
  resolveSpainEpisodeSchedule,
} from "./spain-air-schedule";

describe("inferSpainStreamingBrand", () => {
  it("detecta HBO Max en proveedores ES", () => {
    expect(
      inferSpainStreamingBrand({
        providerNames: ["HBO Max"],
      })
    ).toBe("hbo_max");
  });

  it("detecta TV española por origen", () => {
    expect(
      inferSpainStreamingBrand({
        originCountries: ["ES"],
      })
    ).toBe("spanish_linear");
  });
});

describe("resolveSpainEpisodeSchedule", () => {
  it("aplica curado editorial (FROM T4E6)", () => {
    const schedule = resolveSpainEpisodeSchedule({
      tmdbShowId: 124364,
      tmdbAirDate: "2026-05-31",
      season: 4,
      episode: 6,
    });

    expect(schedule).toMatchObject({
      date: "2026-06-01",
      time: "03:00",
      platform: "HBO Max",
      source: "curated_series",
    });
  });

  it("desplaza domingo US de HBO Max al lunes 03:00 Madrid", () => {
    const schedule = resolveSpainEpisodeSchedule({
      tmdbShowId: 99999,
      tmdbAirDate: "2026-05-31",
      season: 2,
      episode: 4,
      providerNames: ["HBO Max"],
    });

    expect(schedule).toMatchObject({
      date: "2026-06-01",
      time: "03:00",
      platform: "HBO Max",
      source: "hbo_max_rule",
    });
  });

  it("Netflix mantiene fecha y usa drop global 09:00", () => {
    const schedule = resolveSpainEpisodeSchedule({
      tmdbShowId: 88888,
      tmdbAirDate: "2026-06-04",
      season: 1,
      episode: 5,
      providerNames: ["Netflix"],
    });

    expect(schedule).toMatchObject({
      date: "2026-06-04",
      time: "09:00",
      platform: "Netflix",
      source: "global_drop_rule",
    });
  });

  it("series españolas confían en air_date TMDB con hora lineal", () => {
    const schedule = resolveSpainEpisodeSchedule({
      tmdbShowId: 49982,
      tmdbAirDate: "2026-06-02",
      season: 12,
      episode: 3,
      originCountries: ["ES"],
    });

    expect(schedule).toMatchObject({
      date: "2026-06-02",
      time: "22:00",
      source: "spanish_origin",
    });
  });
});

describe("extractSpainTheatricalReleaseDate", () => {
  it("extrae estreno en cines ES", () => {
    const date = extractSpainTheatricalReleaseDate({
      results: [
        {
          iso_3166_1: "US",
          release_dates: [{ type: 3, release_date: "2026-05-01T00:00:00.000Z" }],
        },
        {
          iso_3166_1: "ES",
          release_dates: [
            { type: 3, release_date: "2026-05-29T00:00:00.000Z" },
          ],
        },
      ],
    });

    expect(date).toBe("2026-05-29");
  });
});

import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { resolveChampionsWeekContext } from "./champions-week";
import { resolveEventPosterUrl } from "./event-poster";

describe("resolveEventPosterUrl TV", () => {
  it("prioriza póster TMDB oficial sobre el fallback local", () => {
    const event: EventRow = {
      id: 1,
      title: "Pasapalabra",
      sport: "tv",
      date: "2026-05-28",
      time: "17:00",
      competition: "Concurso · Pasapalabra",
      platform: "Antena 3 · ATRESPLAYER TV",
      source: "tmdb|buzz:98",
    };

    const poster = resolveEventPosterUrl(event, "poster");

    expect(poster).toContain("image.tmdb.org");
    expect(poster).toContain("bEjPWrz2InMeqAjaxNycvaqVL59");
  });
});

describe("resolveChampionsWeekContext crests", () => {
  it("expone escudos cuando el partido trae IDs football-data", () => {
    const events: EventRow[] = [
      {
        id: 10,
        title: "Paris Saint-Germain vs Inter",
        sport: "futbol",
        date: "2026-05-31",
        time: "21:00",
        competition: "UEFA Champions League · Final",
        home_team: "Paris Saint-Germain",
        away_team: "Inter",
        source: "football-data:524:108",
      },
    ];

    const context = resolveChampionsWeekContext(events, "2026-05-28", 7);

    expect(context?.homeCrest).toContain("524");
    expect(context?.awayCrest).toContain("108");
  });
});

import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import {
  CHAMPIONS_FINAL_FALLBACK,
  resolveChampionsWeekContext,
} from "./champions-week";
import { madridDateTimeToUtc } from "./madrid-time";
import { resolveEventPosterUrl } from "./event-poster";

describe("resolveEventPosterUrl TV", () => {
  it("prioriza póster editorial local en programas TV flagship", () => {
    const event: EventRow = {
      id: 1,
      title: "Pasapalabra",
      sport: "tv",
      date: "2026-05-28",
      time: "17:00",
      competition: "Concurso · Pasapalabra",
      platform: "Antena 3 · ATRESPLAYER TV",
      source: "tmdb|buzz:98|/bEjPWrz2InMeqAjaxNycvaqVL59.jpg",
    };

    const poster = resolveEventPosterUrl(event, "poster");

    expect(poster).toBe("/posters/pasapalabra.webp");
  });
});

describe("resolveChampionsWeekContext", () => {
  const psgArsenalFinal: EventRow = {
    id: 10,
    title: "Paris Saint-Germain vs Arsenal",
    sport: "futbol",
    date: "2026-05-30",
    time: "18:00",
    competition: "UEFA Champions League · Final",
    home_team: "Paris Saint-Germain",
    away_team: "Arsenal",
    source: "football-data:524:57",
  };

  const psgInterFinal: EventRow = {
    id: 11,
    title: "Paris Saint-Germain vs Inter",
    sport: "futbol",
    date: "2026-05-31",
    time: "18:00",
    competition: "UEFA Champions League · Final",
    home_team: "Paris Saint-Germain",
    away_team: "Inter",
    source: "football-data:524:108",
  };

  it("expone escudos PSG-Arsenal cuando el partido trae IDs football-data", () => {
    const context = resolveChampionsWeekContext(
      [psgArsenalFinal],
      "2026-05-28",
      7
    );

    expect(context?.homeCrest).toContain("524");
    expect(context?.awayCrest).toContain("57");
    expect(context?.awayTeam).toBe("Arsenal");
  });

  it("usa fallback editorial PSG-Arsenal si no hay final en el feed", () => {
    const context = resolveChampionsWeekContext([], "2026-05-30", 7);

    expect(context?.headline).toBe("Champions League");
    expect(context?.homeTeam).toContain("Paris");
    expect(context?.awayTeam).toBe("Arsenal");
    expect(context?.eventDate).toBe("2026-05-30");
    expect(context?.eventTime).toBe("18:00");
  });

  it("ignora final PSG-Inter obsoleta durante la ventana editorial 2026", () => {
    const context = resolveChampionsWeekContext(
      [psgInterFinal],
      "2026-05-30",
      7
    );

    expect(context?.awayTeam).toBe("Arsenal");
    expect(context?.finalEvent.id).toBe(CHAMPIONS_FINAL_FALLBACK.event.id);
  });

  it("prioriza PSG-Arsenal del feed sobre el fallback editorial", () => {
    const context = resolveChampionsWeekContext(
      [psgInterFinal, psgArsenalFinal],
      "2026-05-30",
      7
    );

    expect(context?.finalEvent.id).toBe(10);
    expect(context?.awayTeam).toBe("Arsenal");
  });

  it("mantiene Semana de Champions activa hasta el 5 de junio", () => {
    const context = resolveChampionsWeekContext([], "2026-06-03", 7);

    expect(context?.awayTeam).toBe("Arsenal");
    expect(context?.eventDate).toBe("2026-05-30");
  });

  it("desactiva la ventana editorial tras el 5 de junio", () => {
    expect(resolveChampionsWeekContext([], "2026-06-06", 7)).toBeNull();
  });

  it("apunta el contador a las 18:00 hora peninsular", () => {
    const context = resolveChampionsWeekContext([], "2026-05-30", 7);
    const kickoff = madridDateTimeToUtc(
      context!.eventDate,
      context!.eventTime
    ).getTime();

    expect(context?.eventTime).toBe("18:00");
    expect(kickoff).toBeGreaterThan(Date.parse("2026-05-30T15:00:00Z"));
    expect(kickoff).toBeLessThan(Date.parse("2026-05-30T17:00:00Z"));
  });
});

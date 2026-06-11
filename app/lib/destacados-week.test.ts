import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import {
  isChampionsWeekDestacado,
  isRolandGarrosKnockout,
  isRolandGarrosWeekDestacado,
  pickWeekDestacados,
} from "./destacados-config";
import { eventPriority, isImportantEvent, isSuperRelevantEvent } from "./featured";
import { formatRolandGarrosCompetition, parseTennisMatchFromEventTitle } from "./roland-garros";

describe("pickWeekDestacados", () => {
  it("incluye Champions en eliminatorias en Esta semana", () => {
    const cl: EventRow = {
      id: 10,
      title: "Paris Saint-Germain vs Arsenal",
      home_team: "Paris Saint-Germain",
      away_team: "Arsenal",
      date: "2026-05-30",
      time: "18:00",
      sport: "futbol",
      competition: "UEFA Champions League · Final",
      platform: "Movistar+, La 1",
    };

    expect(isChampionsWeekDestacado(cl)).toBe(true);

    const week = pickWeekDestacados([cl], {
      todayKey: "2026-05-27",
      windowDays: 7,
    });

    expect(week.some((event) => event.id === 10)).toBe(true);
  });

  it("excluye estrenos de cine ya pasados (p. ej. El drama)", () => {
    const drama: EventRow = {
      id: -1325734,
      external_id: "tmdb_movie_1325734",
      title: "El drama",
      date: "2026-05-29",
      sport: "cine",
      competition: "Cine",
      platform: "Cines",
    };

    const week = pickWeekDestacados([drama], {
      todayKey: "2026-06-11",
      windowDays: 7,
    });

    expect(week.some((event) => event.external_id === drama.external_id)).toBe(
      false
    );
  });

  it("incluye estreno de cine cuando cae en la ventana semanal", () => {
    const drama: EventRow = {
      id: -1325734,
      external_id: "tmdb_movie_1325734",
      title: "El drama",
      date: "2026-05-29",
      sport: "cine",
      competition: "Cine",
      platform: "Cines",
    };

    const week = pickWeekDestacados([drama], {
      todayKey: "2026-05-27",
      windowDays: 7,
    });

    expect(week.some((event) => event.external_id === drama.external_id)).toBe(
      true
    );
  });

  it("incluye Roland Garros en Esta semana", () => {
    const rg: EventRow = {
      id: 20,
      title: "Alexander Blockx vs Alex de Minaur",
      home_team: "Alexander Blockx",
      away_team: "Alex de Minaur",
      date: "2026-05-27",
      time: "09:00",
      sport: "tenis",
      competition: "Roland Garros",
      platform: "Movistar+, DAZN, Eurosport",
    };

    expect(isRolandGarrosWeekDestacado(rg)).toBe(true);

    const week = pickWeekDestacados([rg], {
      todayKey: "2026-05-27",
      windowDays: 7,
    });

    expect(week.some((event) => event.id === 20)).toBe(true);
  });

  it("prioriza eliminatorias de Roland Garros como super relevantes", () => {
    const semi: EventRow = {
      id: 21,
      title: "Jannik Sinner vs Novak Djokovic",
      home_team: "Jannik Sinner",
      away_team: "Novak Djokovic",
      date: "2026-06-06",
      time: "15:00",
      sport: "tenis",
      competition: "Roland Garros · Semifinal",
      platform: "Movistar+, DAZN, Eurosport",
    };

    expect(isRolandGarrosKnockout(semi)).toBe(true);
    expect(isSuperRelevantEvent(semi)).toBe(true);
    expect(isImportantEvent(semi)).toBe(true);
    expect(eventPriority(semi)).toBeGreaterThan(eventPriority({
      ...semi,
      id: 22,
      competition: "Roland Garros",
    }));
  });

  it("normaliza competición Roland Garros desde TheSportsDB", () => {
    expect(
      formatRolandGarrosCompetition(
        "Roland Garros Alexander Blockx vs Alex de Minaur"
      )
    ).toBe("Roland Garros");
    expect(
      formatRolandGarrosCompetition(
        "Roland Garros Semifinal Jannik Sinner vs Novak Djokovic"
      )
    ).toBe("Roland Garros · Semifinal");
    expect(
      formatRolandGarrosCompetition(
        "Roland Garros Final Jannik Sinner vs Carlos Alcaraz"
      )
    ).toBe("Roland Garros · Final");
  });

  it("extrae jugadores de títulos Roland Garros de TheSportsDB", () => {
    expect(
      parseTennisMatchFromEventTitle(
        "Roland Garros Emma Navarro vs Iva Jovic"
      )
    ).toEqual({
      title: "Emma Navarro vs Iva Jovic",
      home: "Emma Navarro",
      away: "Iva Jovic",
    });
    expect(
      parseTennisMatchFromEventTitle(
        "Roland Garros Semifinal Jannik Sinner vs Novak Djokovic"
      )
    ).toEqual({
      title: "Jannik Sinner vs Novak Djokovic",
      home: "Jannik Sinner",
      away: "Novak Djokovic",
    });
  });
});

import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import {
  resolveUfcWeekContext,
  UFC_CASABLANCA_FALLBACK,
  isTopuriaGaethjeFight,
  isUfcWeekEditorialWindow,
} from "./ufc-week";
import { resolvePrimaryWeekHeroContext } from "./week-hero";
import { madridDateTimeToUtc } from "./madrid-time";

describe("resolveUfcWeekContext", () => {
  const topuriaFight: EventRow = {
    id: 20,
    title: "UFC Freedom 250",
    sport: "ufc",
    date: "2026-06-15",
    time: "02:00",
    competition: "Ilia Topuria vs Justin Gaethje · Título ligero",
    home_team: "Ilia Topuria",
    away_team: "Justin Gaethje",
    external_id: "ufc_12345",
    source: "ufc|kind:ppv|num:250",
    platform: "Paramount+",
  };

  it("activa Semana de UFC Casablanca en ventana editorial", () => {
    const context = resolveUfcWeekContext([], "2026-06-01", 7);

    expect(context?.headline).toBe("UFC Casablanca");
    expect(context?.fighter1).toContain("Topuria");
    expect(context?.fighter2).toBe("Justin Gaethje");
    expect(context?.stageLabel).toBe("Freedom 250");
  });

  it("usa fallback editorial si no hay pelea en el feed", () => {
    const context = resolveUfcWeekContext([], "2026-06-10", 7);

    expect(context?.mainEvent.id).toBe(UFC_CASABLANCA_FALLBACK.event.id);
    expect(context?.eventDate).toBe("2026-06-15");
    expect(context?.eventTime).toBe("02:00");
  });

  it("prioriza la pelea del feed sobre el fallback", () => {
    const context = resolveUfcWeekContext([topuriaFight], "2026-06-10", 7);

    expect(context?.mainEvent.id).toBe(20);
    expect(context?.fighter1).toBe("Ilia Topuria");
  });

  it("desactiva la ventana tras el 15 de junio", () => {
    expect(resolveUfcWeekContext([], "2026-06-16", 7)).toBeNull();
    expect(isUfcWeekEditorialWindow("2026-06-16")).toBe(false);
  });

  it("apunta el main event a las 02:00 hora peninsular", () => {
    const context = resolveUfcWeekContext([], "2026-06-10", 7);
    const kickoff = madridDateTimeToUtc(
      context!.eventDate,
      context!.eventTime
    ).getTime();

    expect(context?.eventTime).toBe("02:00");
    expect(kickoff).toBeGreaterThan(Date.parse("2026-06-14T23:00:00Z"));
    expect(kickoff).toBeLessThan(Date.parse("2026-06-15T01:00:00Z"));
  });

  it("detecta Topuria vs Gaethje en distintos campos", () => {
    expect(
      isTopuriaGaethjeFight({
        id: 1,
        sport: "ufc",
        title: "UFC 250",
        competition: "Ilia Topuria vs Justin Gaethje",
      } as EventRow)
    ).toBe(true);
  });
});

describe("resolvePrimaryWeekHeroContext", () => {
  it("prioriza UFC Casablanca sobre Champions en solapamiento", () => {
    const clFinal: EventRow = {
      id: 10,
      title: "Paris Saint-Germain vs Arsenal",
      sport: "futbol",
      date: "2026-05-30",
      time: "18:00",
      competition: "UEFA Champions League · Final",
      home_team: "Paris Saint-Germain",
      away_team: "Arsenal",
    };

    const hero = resolvePrimaryWeekHeroContext([clFinal], "2026-05-30", 7);

    expect(hero?.type).toBe("ufc");
  });
});

import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import {
  isGiroItaliaEvent,
  isMobLandSeriesEvent,
  isUfc329McGregorEvent,
  isUfcPpvEvent,
  isWorldCup2026Event,
  resolveFlagshipCover,
  resolvePosterCover,
} from "./poster-recipes";
import { getSpotlightCardModel } from "./featured-card";
import { MADRID_TZ } from "./timezone";

describe("poster recipe matching", () => {
  it("detecta Mundial 2026", () => {
    const event: EventRow = {
      id: 1,
      title: "México vs Sudáfrica",
      sport: "futbol",
      competition: "FIFA World Cup 2026 · Grupo A",
    };
    expect(isWorldCup2026Event(event)).toBe(true);
    expect(resolvePosterCover(event)?.url).toBe("/flagship/mundial-2026.png");
  });

  it("detecta UFC 329 McGregor", () => {
    const event: EventRow = {
      id: 2,
      title: "UFC 329",
      sport: "ufc",
      competition: "McGregor vs Holloway",
      source: "ufc|kind:ppv|num:329",
    };
    expect(isUfc329McGregorEvent(event)).toBe(true);
    expect(resolvePosterCover(event)?.url).toBe("/flagship/ufc-329.png");
  });

  it("asigna portada UFC genérica a futuros PPV", () => {
    const event: EventRow = {
      id: 20,
      title: "UFC 330",
      sport: "ufc",
      competition: "Jones vs Miocic",
      source: "ufc|kind:ppv|num:330",
    };
    expect(isUfcPpvEvent(event)).toBe(true);
    expect(resolvePosterCover(event)?.url).toBe("/flagship/ufc-ppv.png");
    expect(resolvePosterCover(event)?.recipeId).toBe("ufc-ppv");
  });

  it("asigna portada Road to UFC con logo oficial", () => {
    const event: EventRow = {
      id: 22,
      title: "Road to UFC Season 3 Episode 5",
      sport: "ufc",
      source: "ufc|kind:road",
    };
    expect(resolvePosterCover(event)?.url).toBe("/flagship/ufc-road.png");
    expect(resolvePosterCover(event)?.recipeId).toBe("ufc-road");
  });

  it("asigna portada UFC genérica a Fight Night", () => {
    const event: EventRow = {
      id: 21,
      title: "UFC Fight Night: Taira vs Park",
      sport: "ufc",
      competition: "Taira vs Park",
      source: "ufc|kind:fight-night",
    };
    expect(resolvePosterCover(event)?.url).toBe("/flagship/ufc-ppv.png");
    expect(resolvePosterCover(event)?.recipeId).toBe("ufc-ppv");
  });

  it("detecta Giro d'Italia", () => {
    const event: EventRow = {
      id: 3,
      title: "Etapa 12",
      sport: "ciclismo",
      competition: "Giro d'Italia · Etapa 12",
    };
    expect(isGiroItaliaEvent(event)).toBe(true);
    expect(resolvePosterCover(event)?.url).toBe("/ciclismo/giro-italia.png");
  });

  it("detecta MobLand T2", () => {
    const event: EventRow = {
      id: 4,
      title: "MobLand",
      sport: "series",
      competition: "Estreno · Temporada 2",
    };
    expect(isMobLandSeriesEvent(event)).toBe(true);
    expect(resolveFlagshipCover(event)?.url).toBe("/posters/mobland-s2.png");
  });

  it("asigna portada genérica de fútbol a partidos LaLiga", () => {
    const event: EventRow = {
      id: 7,
      title: "Barça vs Madrid",
      sport: "futbol",
      competition: "LaLiga · Jornada 38",
    };
    expect(resolvePosterCover(event)?.url).toBe("/deportes/futbol.png");
  });
});

describe("getSpotlightCardModel flagship posters", () => {
  it("asigna portada Roland Garros en fases finales", () => {
    const event: EventRow = {
      id: 5,
      title: "Alcaraz vs Sinner",
      sport: "tenis",
      date: "2026-06-05",
      competition: "Roland Garros · Semifinal",
      home_team: "Alcaraz",
      away_team: "Sinner",
    };

    const card = getSpotlightCardModel(event, MADRID_TZ);

    expect(card.coverImage?.url).toBe("/flagship/roland-garros-knockout.png");
    expect(card.visualClass).toBe("qvh-spotlight-visual-rg-knockout");
  });

  it("asigna portada baloncesto en lugar del fallback genérico", () => {
    const event: EventRow = {
      id: 6,
      title: "Barça vs Real Madrid",
      sport: "basket",
      date: "2026-05-28",
      competition: "ACB · Playoffs",
      home_team: "Barça",
      away_team: "Real Madrid",
    };

    const card = getSpotlightCardModel(event, MADRID_TZ);

    expect(card.coverImage?.url).toBe("/deportes/baloncesto.png");
    expect(card.visualClass).toBe("qvh-spotlight-visual-basket");
    expect(card.showBasketballDuel).toBe(true);
  });
});

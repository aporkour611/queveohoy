import { describe, expect, it } from "vitest";
import {
  destacadoHasQualityVisual,
  isGenericSportPlaceholderUrl,
} from "./poster-quality";
import type { EventRow } from "../components/types";

describe("isGenericSportPlaceholderUrl", () => {
  it("detecta placeholders deportes", () => {
    expect(isGenericSportPlaceholderUrl("/deportes/futbol.png")).toBe(true);
    expect(isGenericSportPlaceholderUrl("/deportes/ufc/topuria-lcp.webp")).toBe(
      false
    );
    expect(isGenericSportPlaceholderUrl("/posters/mask-singer.webp")).toBe(false);
  });
});

describe("destacadoHasQualityVisual", () => {
  it("rechaza ciclismo sin póster real", () => {
    const event: EventRow = {
      id: 1,
      title: "Etapa",
      sport: "ciclismo",
      date: "2026-07-03",
      time: "15:00",
      competition: "Vuelta",
      platform: "TV",
    };
    expect(destacadoHasQualityVisual(event)).toBe(false);
  });

  it("acepta Champions editorial", () => {
    const event: EventRow = {
      id: 2,
      title: "PSG vs Arsenal",
      home_team: "PSG",
      away_team: "Arsenal",
      sport: "futbol",
      date: "2026-07-03",
      time: "18:00",
      competition: "UEFA Champions League · Final",
      platform: "Movistar+",
    };
    expect(destacadoHasQualityVisual(event)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import {
  indexDisplayEventsByDate,
  resolveHomeDayEvents,
} from "./upcoming-events";

function event(
  id: number,
  date: string,
  sport: string,
  title: string
): EventRow {
  return {
    id,
    title,
    date,
    time: "20:00",
    sport,
    home_team: sport === "futbol" ? "A" : null,
    away_team: sport === "futbol" ? "B" : null,
    competition: sport === "futbol" ? "La Liga" : sport,
    platform: "TV",
    external_id: `${sport}_${id}`,
    source: sport === "futbol" ? "football-data:1:2" : null,
  };
}

describe("resolveHomeDayEvents", () => {
  it("rellena hoy con próximos eventos cuando hay pocos", () => {
    const events = [
      event(1, "2026-05-27", "ciclismo", "Giro etapa"),
      event(2, "2026-05-28", "ufc", "UFC"),
      event(3, "2026-05-30", "futbol", "PSG vs Arsenal"),
    ];
    const byDate = indexDisplayEventsByDate(events);
    const result = resolveHomeDayEvents(
      byDate,
      "2026-05-27",
      "2026-05-27",
      new Set(),
      true
    );

    expect(result.todayEvents.map((e) => e.id)).toEqual([1]);
    expect(result.upcomingEvents.map((e) => e.id)).toEqual([2, 3]);
    expect(result.upcomingMessage).toBeTruthy();
  });

  it("no rellena si hoy ya tiene suficientes eventos", () => {
    const events = [
      event(1, "2026-05-27", "ciclismo", "Giro"),
      event(2, "2026-05-27", "ufc", "UFC"),
      event(3, "2026-05-27", "motos", "MotoGP"),
      event(4, "2026-05-28", "futbol", "Final"),
    ];
    const byDate = indexDisplayEventsByDate(events);
    const result = resolveHomeDayEvents(
      byDate,
      "2026-05-27",
      "2026-05-27",
      new Set(),
      true
    );

    expect(result.upcomingEvents).toHaveLength(0);
    expect(result.upcomingMessage).toBeNull();
  });
});

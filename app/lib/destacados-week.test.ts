import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import {
  isChampionsWeekDestacado,
  pickWeekDestacados,
} from "./destacados-config";

describe("pickWeekDestacados", () => {
  it("incluye Champions en eliminatorias en Esta semana", () => {
    const cl: EventRow = {
      id: 10,
      title: "Paris Saint-Germain vs Arsenal",
      home_team: "Paris Saint-Germain",
      away_team: "Arsenal",
      date: "2026-05-31",
      time: "21:00",
      sport: "futbol",
      competition: "UEFA Champions League · Semifinal",
      platform: "Movistar+, La 1",
    };

    expect(isChampionsWeekDestacado(cl)).toBe(true);

    const week = pickWeekDestacados([cl], {
      todayKey: "2026-05-27",
      windowDays: 7,
    });

    expect(week.some((event) => event.id === 10)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { pickTodayDestacados, pickWeekDestacados, sortDestacadosBySoonest } from "./destacados-config";
import {
  getDestacadoImportanceTier,
  pickOneDestacadoPerTier,
  sortDestacadosByImportance,
} from "./destacados-importance";

const cine: EventRow = {
  id: 1,
  title: "El Drama",
  sport: "cine",
  date: "2026-05-28",
  time: "20:00",
  competition: "Estreno",
  platform: "Netflix",
};

const champions: EventRow = {
  id: 2,
  title: "PSG vs Arsenal",
  home_team: "PSG",
  away_team: "Arsenal",
  sport: "futbol",
  date: "2026-05-31",
  time: "21:00",
  competition: "UEFA Champions League · Semifinal",
  platform: "Movistar+",
};

const ufc: EventRow = {
  id: 3,
  title: "UFC 312",
  sport: "ufc",
  date: "2026-05-29",
  time: "05:00",
  competition: "UFC · Main Card",
  platform: "DAZN",
};

const reality: EventRow = {
  id: 4,
  title: "La Isla de las Tentaciones",
  sport: "tv",
  date: "2026-05-28",
  time: "22:00",
  competition: "Reality · La Isla",
  platform: "Telecinco",
};

const series: EventRow = {
  id: 5,
  title: "FROM — T4E6",
  sport: "series",
  date: "2026-06-01",
  time: "03:00",
  competition: "Nuevo episodio",
  platform: "HBO Max",
};

describe("destacados importance tiers", () => {
  it("clasifica eventos en la categoría más prioritaria aplicable", () => {
    expect(getDestacadoImportanceTier(cine)).toBe("cine");
    expect(getDestacadoImportanceTier(champions)).toBe("champions");
    expect(getDestacadoImportanceTier(ufc)).toBe("ufc");
    expect(getDestacadoImportanceTier(reality)).toBe("reality");
    expect(getDestacadoImportanceTier(series)).toBe("series");
  });

  it("ordena por importancia editorial, no cronológicamente", () => {
    const sorted = [series, ufc, cine, champions].sort(sortDestacadosByImportance);

    expect(sorted.map((event) => event.id)).toEqual([1, 2, 3, 5]);
  });

  it("devuelve solo una ficha por categoría", () => {
    const picked = pickOneDestacadoPerTier([
      cine,
      { ...cine, id: 11, title: "Otra peli" },
      champions,
      ufc,
      reality,
      series,
    ]);

    expect(picked).toHaveLength(5);
    expect(new Set(picked.map((event) => getDestacadoImportanceTier(event))).size).toBe(
      5
    );
  });
});

describe("pickWeekDestacados", () => {
  it("elige una ficha por categoría y las ordena cronológicamente", () => {
    const week = pickWeekDestacados([cine, champions, ufc, reality, series], {
      todayKey: "2026-05-27",
      windowDays: 7,
    });

    const tiers = week.map((event) => getDestacadoImportanceTier(event));
    expect(new Set(tiers).size).toBe(tiers.length);

    for (let i = 1; i < week.length; i++) {
      expect(sortDestacadosBySoonest(week[i - 1], week[i])).toBeLessThanOrEqual(0);
    }
  });
});

describe("pickTodayDestacados", () => {
  it("ordena el día por importancia editorial", () => {
    const today = pickTodayDestacados(
      [
        { ...champions, date: "2026-05-28" },
        { ...cine, date: "2026-05-28" },
        { ...ufc, date: "2026-05-28" },
      ],
      {
        todayKey: "2026-05-28",
        windowDays: 7,
      }
    );

    const ours = today.filter((event) => [1, 2, 3].includes(event.id));
    expect(ours.map((event) => getDestacadoImportanceTier(event))).toEqual([
      "cine",
      "champions",
      "ufc",
    ]);
  });
});

import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { eventMatchesAgendaQuery, filterEventsByAgendaQuery } from "./agenda-search";

const sample: EventRow = {
  id: 1,
  title: "Real Madrid vs Barcelona",
  sport: "futbol",
  date: "2026-05-30",
  time: "21:00",
  competition: "LaLiga",
  home_team: "Real Madrid",
  away_team: "Barcelona",
};

describe("agenda-search", () => {
  it("coincide por equipo sin acentos", () => {
    expect(eventMatchesAgendaQuery(sample, "barcelona")).toBe(true);
  });

  it("vacío no filtra", () => {
    expect(filterEventsByAgendaQuery([sample], "   ")).toEqual([sample]);
  });

  it("sin coincidencias devuelve lista vacía", () => {
    expect(filterEventsByAgendaQuery([sample], "tenis")).toEqual([]);
  });
});

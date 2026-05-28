import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import {
  isChampionsCompetitionTitle,
  resolveChampionsWeekContext,
} from "./champions-week";

const championsFinal: EventRow = {
  id: 100,
  title: "Paris Saint-Germain vs Inter",
  home_team: "Paris Saint-Germain",
  away_team: "Inter",
  date: "2026-05-31",
  time: "21:00",
  sport: "futbol",
  competition: "UEFA Champions League · Final",
  platform: "Movistar+, La 1",
};

describe("resolveChampionsWeekContext", () => {
  it("activa el diseño cuando hay final de Champions en la ventana", () => {
    const context = resolveChampionsWeekContext([championsFinal], "2026-05-27", 7);

    expect(context?.isActive).toBe(true);
    expect(context?.kicker).toBe("Semana de");
    expect(context?.headline).toBe("Champions League");
    expect(context?.stageLabel).toBe("Final");
    expect(context?.homeTeam).toBe("Paris Saint-Germain");
    expect(context?.awayTeam).toBe("Inter");
  });

  it("no activa el diseño si la final queda fuera de la ventana", () => {
    const context = resolveChampionsWeekContext([championsFinal], "2026-06-01", 7);

    expect(context).toBeNull();
  });

  it("no activa el diseño para semifinales sin final", () => {
    const semi: EventRow = {
      ...championsFinal,
      id: 101,
      competition: "UEFA Champions League · Semifinal",
    };

    expect(resolveChampionsWeekContext([semi], "2026-05-27", 7)).toBeNull();
  });
});

describe("isChampionsCompetitionTitle", () => {
  it("detecta bloques de competición Champions", () => {
    expect(isChampionsCompetitionTitle("UEFA Champions League")).toBe(true);
    expect(isChampionsCompetitionTitle("LaLiga")).toBe(false);
  });
});

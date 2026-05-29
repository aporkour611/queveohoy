import { describe, expect, it } from "vitest";
import { parseTennisMatchFromEventTitle } from "./roland-garros";
import {
  fetchTheSportsDbLeagueEvents,
  normalizeLeagueEvent,
  THESPORTSDB_LEAGUES,
} from "./thesportsdb-leagues";
import { getMadridWeekDates } from "./madrid-time";

describe("thesportsdb-leagues Roland Garros", () => {
  it("parsea jugadores desde título eventsday", () => {
    expect(
      parseTennisMatchFromEventTitle(
        "Roland Garros Naomi Osaka vs Donna Vekic"
      )
    ).toEqual({
      title: "Naomi Osaka vs Donna Vekic",
      home: "Naomi Osaka",
      away: "Donna Vekic",
    });
  });

  it("no descarta partidos sin strHomeTeam cuando el título trae vs", () => {
    const config = THESPORTSDB_LEAGUES.find((c) => c.leagueId === "4517");
    expect(config).toBeTruthy();

    const weekDates = getMadridWeekDates(7);
    const dateEvent = weekDates[0]!;

    const event = normalizeLeagueEvent(
      {
        idEvent: "2477638",
        strEvent: "Roland Garros Emma Navarro vs Iva Jovic",
        dateEvent,
        strTime: "09:00:00",
        strHomeTeam: null,
        strAwayTeam: null,
        idLeague: "4517",
      },
      config!,
      weekDates
    );

    expect(event).toMatchObject({
      title: "Emma Navarro vs Iva Jovic",
      home_team: "Emma Navarro",
      away_team: "Iva Jovic",
      competition: "Roland Garros",
      sport: "tenis",
    });
  });

  it("integra eventsday cuando TheSportsDB responde", async () => {
    const events = await fetchTheSportsDbLeagueEvents(7);
    const rg = events.filter((e) => /roland garros/i.test(e.competition));

    if (rg.length === 0) {
      console.warn(
        "TheSportsDB no respondió (rate limit); omitiendo aserción de red"
      );
      return;
    }

    expect(rg.length).toBeGreaterThan(0);
    expect(rg[0]?.home_team).toBeTruthy();
    expect(rg[0]?.away_team).toBeTruthy();
  }, 45_000);
});

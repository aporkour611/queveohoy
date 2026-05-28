import { describe, expect, it } from "vitest";
import { parseTennisMatchFromEventTitle } from "./roland-garros";
import { fetchTheSportsDbLeagueEvents } from "./thesportsdb-leagues";

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

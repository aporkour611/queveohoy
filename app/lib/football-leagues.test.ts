import { describe, expect, it } from "vitest";
import {
  FOOTBALL_DATA_CODES,
  defaultChannelsForFootballCompetition,
  footballLeagueMatchClass,
  resolveFootballLeague,
} from "./football-leagues";

describe("football-leagues", () => {
  it("includes new league codes for cron ingest", () => {
    expect(FOOTBALL_DATA_CODES).toContain("SD");
    expect(FOOTBALL_DATA_CODES).toContain("DED");
    expect(FOOTBALL_DATA_CODES).toContain("PPL");
  });

  it("resolves LaLiga styling and channels", () => {
    const league = resolveFootballLeague("LaLiga EA Sports");
    expect(league?.code).toBe("PD");
    expect(footballLeagueMatchClass("Primera División")).toBe("fh-match_laliga");
    expect(defaultChannelsForFootballCompetition("LaLiga")).toContain("DAZN");
  });

  it("resolves Segunda and Bundesliga", () => {
    expect(resolveFootballLeague("LaLiga Hypermotion")?.code).toBe("SD");
    expect(footballLeagueMatchClass("Bundesliga")).toBe("fh-match_bundesliga");
  });
});

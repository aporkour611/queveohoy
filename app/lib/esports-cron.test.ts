import { describe, expect, it } from "vitest";
import {
  isValidPandascoreMatchForImport,
  shouldPurgeStoredEsportsEvent,
} from "./esports-cron";

describe("isValidPandascoreMatchForImport", () => {
  it("accepts any tier when both teams are confirmed", () => {
    expect(
      isValidPandascoreMatchForImport({
        league: { name: "VCT EMEA Open Qualifier" },
        opponents: [
          { opponent: { name: "Team Alpha" } },
          { opponent: { name: "Team Beta" } },
        ],
      })
    ).toBe(true);
  });

  it("rejects placeholder teams", () => {
    expect(
      isValidPandascoreMatchForImport({
        league: { name: "VCT" },
        opponents: [
          { opponent: { name: "TBD" } },
          { opponent: { name: "Team Beta" } },
        ],
      })
    ).toBe(false);
  });
});

describe("shouldPurgeStoredEsportsEvent", () => {
  it("does not purge minor leagues anymore", () => {
    expect(
      shouldPurgeStoredEsportsEvent({
        sport: "valorant",
        competition: "Challenger Open Qualifier",
        home_team: "Alpha",
        away_team: "Beta",
      })
    ).toBe(false);
  });

  it("purges placeholder teams", () => {
    expect(
      shouldPurgeStoredEsportsEvent({
        sport: "valorant",
        competition: "VCT",
        home_team: "TBD",
        away_team: "Beta",
      })
    ).toBe(true);
  });
});

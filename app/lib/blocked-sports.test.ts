import { describe, expect, it } from "vitest";
import {
  BLOCKED_SPORT_IDS,
  filterBlockedSports,
  isBlockedSport,
} from "./blocked-sports";

describe("blocked-sports", () => {
  it("bloquea dota2", () => {
    expect(isBlockedSport("dota2")).toBe(true);
    expect(BLOCKED_SPORT_IDS).toContain("dota2");
  });

  it("no bloquea e-sports activos", () => {
    expect(isBlockedSport("csgo")).toBe(false);
    expect(isBlockedSport("valorant")).toBe(false);
    expect(isBlockedSport("lol")).toBe(false);
  });

  it("filtra eventos bloqueados del feed", () => {
    const events = [
      { id: "1", sport: "lol" },
      { id: "2", sport: "dota2" },
      { id: "3", sport: "futbol" },
    ];
    expect(filterBlockedSports(events).map((e) => e.id)).toEqual(["1", "3"]);
  });
});

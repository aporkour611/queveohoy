import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { resolveEventCrestUrlLists } from "./match-card-crests";

describe("resolveEventCrestUrlLists", () => {
  it("prioriza crest local para e-sports", () => {
    const event: EventRow = {
      id: 1,
      title: "KC vs G2",
      sport: "valorant",
      date: "2026-07-05",
      source:
        "pandascore-logos:https://cdn.pandascore.co/images/team/image/130922/a.png::https://cdn.pandascore.co/images/team/image/128538/b.png",
    };
    const { homeCrestUrls, homeCrest } = resolveEventCrestUrlLists(event);
    expect(homeCrestUrls[0]).toMatch(/^\/crests\/esports\//);
    expect(homeCrest).toBe(homeCrestUrls[0]);
  });

  it("resuelve fútbol con football-data ids", () => {
    const event: EventRow = {
      id: 2,
      title: "PSG vs Inter",
      sport: "futbol",
      date: "2026-07-05",
      source: "football-data:524:108",
    };
    const { homeCrestUrls } = resolveEventCrestUrlLists(event);
    expect(homeCrestUrls.length).toBeGreaterThan(0);
    expect(homeCrestUrls[0]).toMatch(/^(\/crests\/football\/|https:\/\/crests\.football-data\.org\/)/);
  });
});

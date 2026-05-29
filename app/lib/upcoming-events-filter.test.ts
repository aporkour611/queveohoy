import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import {
  eventCanDisplay,
  filterPublishableEvents,
} from "./event-crests";
import { indexDisplayEventsByDate } from "./upcoming-events";

function esportsEvent(id: number, hasLogos: boolean): EventRow {
  return {
    id,
    title: `Match ${id}`,
    date: "2026-05-28",
    time: "18:00",
    sport: "valorant",
    home_team: "Alpha",
    away_team: "Beta",
    competition: "Challenger Qualifier",
    platform: "Twitch",
    external_id: `esports_${id}`,
    source: hasLogos ? "pandascore-logos:https://a.png::https://b.png" : "pandascore",
  };
}

describe("filterPublishableEvents vs eventCanDisplay", () => {
  it("keeps minor esports without logos publishable but not in destacados", () => {
    const event = esportsEvent(1, false);

    expect(filterPublishableEvents([event])).toHaveLength(1);
    expect(eventCanDisplay(event)).toBe(false);
  });
});

describe("indexDisplayEventsByDate", () => {
  it("indexes publishable events even without crests", () => {
    const byDate = indexDisplayEventsByDate([esportsEvent(2, false)]);

    expect(byDate.get("2026-05-28")).toHaveLength(1);
  });
});

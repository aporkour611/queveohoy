import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { getSpotlightCardModel } from "./featured-card";
import { MADRID_TZ } from "./timezone";

describe("getSpotlightCardModel UFC badge", () => {
  it("muestra UFC en lugar de temporada/episodio en Road to UFC", () => {
    const event: EventRow = {
      id: 1,
      title: "Road to UFC",
      sport: "ufc",
      date: "2026-06-05",
      time: "22:00",
      competition: "Temporada 5 · Episodio 1",
      platform: "UFC Apex · Las Vegas, USA",
      source: "ufc|kind:road",
    };

    const card = getSpotlightCardModel(event, MADRID_TZ);

    expect(card.badge).toBe("UFC");
    expect(card.meta).toContain("Temporada 5");
  });

  it("conserva el número en carteleras PPV numeradas", () => {
    const event: EventRow = {
      id: 2,
      title: "UFC 316",
      sport: "ufc",
      date: "2026-06-07",
      time: "05:00",
      competition: "Main card",
      platform: "Prudential Center · Newark, USA",
      source: "ufc|kind:ppv|num:316",
    };

    expect(getSpotlightCardModel(event, MADRID_TZ).badge).toBe("UFC 316");
  });
});

describe("getSpotlightCardModel TV posters", () => {
  it("usa portada editorial PNG para El Hormiguero", () => {
    const event: EventRow = {
      id: 3,
      title: "El Hormiguero",
      sport: "tv",
      date: "2026-05-28",
      time: "22:00",
      competition: "Talk show · El Hormiguero",
      platform: "Antena 3 · ATRESPLAYER TV",
    };

    const card = getSpotlightCardModel(event, MADRID_TZ);

    expect(card.coverImage?.local).toBe(true);
    expect(card.coverImage?.url).toBe("/posters/el-hormiguero.webp");
    expect(card.channelList).toEqual(["Antena 3", "ATRESPLAYER TV"]);
  });
});

describe("getSpotlightCardModel esports channels", () => {
  it("expone Twitch y YouTube como pegatinas separadas", () => {
    const event: EventRow = {
      id: 4,
      title: "Team A vs Team B",
      sport: "csgo",
      date: "2026-05-28",
      time: "20:00",
      platform: "Twitch · YouTube",
    };

    expect(getSpotlightCardModel(event, MADRID_TZ).channelList).toEqual([
      "Twitch",
      "YouTube",
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { livePath } from "./event-slug";
import { resolveLivePlayerEmbed } from "./live-player";
import type { EventRow } from "../components/types";

describe("resolveLivePlayerEmbed", () => {
  it("genera embed de Twitch con parent del sitio", () => {
    const player = resolveLivePlayerEmbed(
      "Twitch · Ibai",
      "https://queveohoy.es"
    );

    expect(player.kind).toBe("twitch");
    expect(player.embedSrc).toContain("player.twitch.tv");
    expect(player.embedSrc).toContain("parent=queveohoy.es");
    expect(player.embedSrc).toContain("channel=ibai");
  });

  it("genera embed de La 1 en RTVE", () => {
    const player = resolveLivePlayerEmbed("La 1", "https://queveohoy.es");

    expect(player.kind).toBe("rtve");
    expect(player.embedSrc).toContain("rtve.es/play/embed");
    expect(player.embedSrc).toContain("la-1");
  });
});

describe("livePath", () => {
  it("ruta estable por evento", () => {
    const event: EventRow = {
      id: 1,
      title: "Real Madrid vs Barcelona",
      date: "2026-05-27",
      time: "21:00",
      sport: "futbol",
      home_team: "Real Madrid",
      away_team: "Barcelona",
    };

    expect(livePath(event)).toBe(
      "/vivo/2026-05-27-real-madrid-vs-barcelona"
    );
  });
});

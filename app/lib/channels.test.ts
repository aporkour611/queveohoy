import { describe, expect, it } from "vitest";
import { prioritizeChannels, resolveChannelsForEvent, channelStyle } from "./channels";

describe("prioritizeChannels", () => {
  it("prioriza gratuitos y limita a 3", () => {
    const result = prioritizeChannels(
      [
        "Movistar+",
        "Orange Fútbol 1",
        "La 1",
        "M+ Liga de Campeones",
        "RTVE Play",
      ],
      3
    );

    expect(result).toEqual(["La 1", "RTVE Play", "Movistar+"]);
  });
});

describe("channelStyle", () => {
  it("marca gratuitos con borde verde aunque tengan color de marca", () => {
    const rtve = channelStyle("La 1");
    expect(rtve.tier).toBe("free");
    expect(rtve.bg).toMatch(/e30613/i);
    expect(rtve.border).toBe("#5a9e28");

    const movistar = channelStyle("Movistar+");
    expect(movistar.tier).toBe("paid");
    expect(movistar.bg).toMatch(/00a0e3/i);
  });
});

describe("resolveChannelsForEvent", () => {
  it("limita Champions a 3 canales priorizando gratuitos", () => {
    const result = resolveChannelsForEvent({
      sport: "futbol",
      competition: "UEFA Champions League",
      platform:
        "Movistar+, Orange Fútbol 1, La 1, M+ Liga de Campeones, RTVE Play",
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toMatch(/la 1/i);
    expect(result[1]).toMatch(/rtve play/i);
  });

  it("no limita otras competiciones", () => {
    const result = resolveChannelsForEvent({
      sport: "futbol",
      competition: "LaLiga EA Sports",
      platform: "Movistar+, DAZN LaLiga, Gol Play",
    });

    expect(result).toHaveLength(3);
  });
});

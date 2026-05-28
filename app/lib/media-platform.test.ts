import { describe, expect, it } from "vitest";
import {
  formatChannelLabel,
  resolveEventChannelList,
} from "./media-platform";

describe("formatChannelLabel", () => {
  it("no fusiona Antena 3 y ATRESPLAYER", () => {
    expect(formatChannelLabel("Antena 3")).toBe("Antena 3");
    expect(formatChannelLabel("ATRESPLAYER TV")).toBe("ATRESPLAYER TV");
  });

  it("normaliza Twitch y YouTube por separado", () => {
    expect(formatChannelLabel("twitch")).toBe("Twitch");
    expect(formatChannelLabel("YouTube Gaming")).toBe("YouTube");
  });
});

describe("resolveEventChannelList", () => {
  it("devuelve pegatinas separadas para esports", () => {
    expect(
      resolveEventChannelList({
        sport: "csgo",
        platform: "Twitch · YouTube",
      })
    ).toEqual(["Twitch", "YouTube"]);
  });

  it("separa canales de TV lineal y streaming", () => {
    expect(
      resolveEventChannelList({
        sport: "tv",
        platform: "Antena 3 · ATRESPLAYER TV",
      })
    ).toEqual(["Antena 3", "ATRESPLAYER TV"]);
  });

  it("separa La 1 y RTVE Play", () => {
    expect(
      resolveEventChannelList({
        sport: "tv",
        platform: "La 1 · RTVE Play",
      })
    ).toEqual(["La 1", "RTVE Play"]);
  });
});

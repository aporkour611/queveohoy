import { describe, expect, it } from "vitest";
import { channelSlug, channelWatchPath, findChannelBySlug } from "./channel-slug";
import { resolveLivePlayerEmbed } from "./live-player";

describe("channelSlug", () => {
  it("genera slug estable", () => {
    expect(channelSlug("La 1")).toBe("la-1");
    expect(channelSlug("Twitch · Ibai")).toBe("twitch-ibai");
  });

  it("ruta de retransmisión por canal", () => {
    expect(channelWatchPath("La 1")).toBe("/directo/la-1");
  });

  it("resuelve canal desde slug", () => {
    const names = ["La 1", "Movistar+", "Twitch · Ibai"];
    expect(findChannelBySlug("la-1", names)).toBe("La 1");
    expect(findChannelBySlug("twitch-ibai", names)).toBe("Twitch · Ibai");
  });
});

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

  it("enlaza Antena 3 al directo de ATRESPLAYER TV", () => {
    const player = resolveLivePlayerEmbed("Antena 3", "https://queveohoy.es");

    expect(player.kind).toBe("atresplayer");
    expect(player.externalUrl).toContain("atresplayer.com/directos/antena3");
  });
});

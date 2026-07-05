import { describe, expect, it } from "vitest";
import {
  esportsTeamRegistryKey,
  extractPandascoreTeamId,
  lookupPinnedByKey,
  resolveCrestUrlList,
  resolveEsportsCrestUrls,
  resolveFootballCrestUrls,
} from "./pinned-images";

describe("pinned-images", () => {
  it("extrae team id de URL PandaScore", () => {
    expect(
      extractPandascoreTeamId(
        "https://cdn.pandascore.co/images/team/image/130922/logo.png"
      )
    ).toBe(130922);
  });

  it("resuelve lista con local fijado primero", () => {
    const list = resolveCrestUrlList(
      esportsTeamRegistryKey(42),
      "https://cdn.pandascore.co/images/team/image/42/x.png",
      ["https://cdn.pandascore.co/images/team/image/42/image.png"]
    );
    expect(list[0]).toMatch(/^https:\/\/cdn\.pandascore\.co\//);
    expect(list.length).toBeGreaterThan(0);
  });

  it("lookupPinnedByKey vacío sin registro", () => {
    expect(lookupPinnedByKey("esports:team:999999991")).toBeNull();
  });

  it("resolveEsportsCrestUrls deduplica fallbacks", () => {
    const url = "https://cdn.pandascore.co/images/team/image/1/a.png";
    const list = resolveEsportsCrestUrls(url, [url]);
    expect(list.filter((u) => u === url).length).toBe(1);
  });
  it("resolveEsportsCrestUrls prioriza crest local fijado (130922)", () => {
    const remote =
      "https://cdn.pandascore.co/images/team/image/130922/600px_karmine_corp_lightmode_full.png";
    const list = resolveEsportsCrestUrls(remote, [remote]);
    expect(list[0]).toMatch(/^\/crests\/esports\//);
    expect(lookupPinnedByKey("esports:team:130922")).toMatch(/^\/crests\/esports\//);
  });

  it("resolveFootballCrestUrls prioriza crest local fijado (762)", () => {
    const list = resolveFootballCrestUrls("762");
    expect(list[0]).toMatch(/^\/crests\/football\/762\./);
  });
});

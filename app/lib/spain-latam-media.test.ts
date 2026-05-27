import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import {
  isExcludedUsTvTitle,
  isSpainLatamRelevantMediaEvent,
} from "./spain-latam-media";

describe("spain-latam-media", () => {
  it("excluye Jeopardy y game shows US", () => {
    expect(isExcludedUsTvTitle("Jeopardy!")).toBe(true);
    expect(isExcludedUsTvTitle("Wheel of Fortune")).toBe(true);
    expect(isExcludedUsTvTitle("MasterChef")).toBe(false);
  });

  it("filtra Jeopardy del feed pero mantiene deportes", () => {
    const jeopardy: EventRow = {
      id: 1,
      title: "Jeopardy! — T41E120",
      sport: "tv",
      external_id: "tmdb_tv_reality_123_2026-05-28_s41e120",
    };
    const cl: EventRow = {
      id: 2,
      title: "PSG vs Arsenal",
      sport: "futbol",
      competition: "UEFA Champions League · Semifinal",
    };

    expect(isSpainLatamRelevantMediaEvent(jeopardy)).toBe(false);
    expect(isSpainLatamRelevantMediaEvent(cl)).toBe(true);
  });
});

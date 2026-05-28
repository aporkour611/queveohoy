import { describe, expect, it } from "vitest";
import {
  isAnimeSeriesTitle,
  isTmdbAnimeSeries,
  resolveFeedSport,
} from "./anime-classify";
import type { EventRow } from "../components/types";

describe("anime-classify", () => {
  it("detects Re:Zero by title", () => {
    expect(isAnimeSeriesTitle("Re:Zero — T3E1")).toBe(true);
    expect(isAnimeSeriesTitle("Re-Zero Starting Life in Another World")).toBe(true);
    expect(isAnimeSeriesTitle("Breaking Bad")).toBe(false);
  });

  it("classifies TMDB anime with animation + JP origin", () => {
    expect(
      isTmdbAnimeSeries({
        genres: [{ id: 16 }],
        origin_country: ["JP"],
      })
    ).toBe(true);
    expect(
      isTmdbAnimeSeries({
        genres: [{ id: 16 }],
        origin_country: ["US"],
      })
    ).toBe(false);
    expect(
      isTmdbAnimeSeries({
        genres: [{ id: 18 }],
        origin_country: ["JP"],
      })
    ).toBe(false);
  });

  it("routes series rows to anime feed sport when title matches", () => {
    const event = {
      id: 1,
      sport: "series",
      title: "Re:Zero — T3E1",
    } as EventRow;

    expect(resolveFeedSport(event)).toBe("anime");
  });
});

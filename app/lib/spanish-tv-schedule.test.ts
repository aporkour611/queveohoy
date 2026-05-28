import { describe, expect, it } from "vitest";
import {
  matchSpanishTvByTvmazeShow,
  matchSpanishTvShowName,
} from "./spanish-tv-curated";
import { STREAMING_PRIORITY_TMDB_IDS } from "./streaming-curated";

describe("spanish-tv-curated flagship matching", () => {
  it("resuelve programas por TVmaze show id", () => {
    expect(matchSpanishTvByTvmazeShow(79483)?.id).toBe("la-revuelta");
    expect(matchSpanishTvByTvmazeShow(74973)?.id).toBe("suenos-libertad");
    expect(matchSpanishTvByTvmazeShow(82594)?.id).toBe("la-promesa");
  });

  it("resuelve El Hormiguero y Pasapalabra por nombre", () => {
    expect(matchSpanishTvShowName("El Hormiguero")?.id).toBe("el-hormiguero");
    expect(matchSpanishTvShowName("Pasapalabra")?.id).toBe("pasapalabra");
  });
});

describe("streaming-curated", () => {
  it("incluye los hits de streaming más consumidos en España", () => {
    expect(STREAMING_PRIORITY_TMDB_IDS).toContain(66732);
    expect(STREAMING_PRIORITY_TMDB_IDS).toContain(91239);
    expect(STREAMING_PRIORITY_TMDB_IDS).toContain(259024);
    expect(STREAMING_PRIORITY_TMDB_IDS).toContain(67006);
  });
});

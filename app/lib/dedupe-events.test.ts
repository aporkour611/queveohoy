import { describe, expect, it } from "vitest";
import { dedupeEvents, eventDedupeKey } from "./dedupe-events";

describe("dedupe-events", () => {
  it("fusiona Sueños de libertad con mismo día y hora", () => {
    const events = [
      {
        id: 1,
        title: "Sueños de libertad",
        sport: "tv",
        date: "2026-05-28",
        time: "15:45",
        external_id: "curated_tv_suenos-libertad_2026-05-28",
      },
      {
        id: 2,
        title: "Sueños de libertad — T12E34",
        sport: "tv",
        date: "2026-05-28",
        time: "15:45",
        external_id: "tmdb_tv_12345_2026-05-28",
        competition: "Ficción · Sueños de libertad",
      },
    ];

    expect(eventDedupeKey(events[0])).toBe(eventDedupeKey(events[1]));
    expect(dedupeEvents(events)).toHaveLength(1);
  });
});

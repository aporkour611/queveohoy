import { describe, expect, it } from "vitest";
import { mergeCuratedSpanishTvEvents } from "./curated-tv-events";

describe("mergeCuratedSpanishTvEvents", () => {
  it("inserta MasterChef los lunes a las 22:50 con póster TMDB", () => {
    const events = mergeCuratedSpanishTvEvents([], "2026-06-01", 7);
    const masterChef = events.find((event) => /master\s*chef/i.test(event.title ?? ""));

    expect(masterChef).toBeDefined();
    expect(masterChef?.date).toBe("2026-06-01");
    expect(masterChef?.time).toBe("22:50");
    expect(masterChef?.platform).toContain("La 1");
    expect(masterChef?.source).toContain("9p3sgMqNulDMsHbk2ZdOsWoJqTq");
  });
});

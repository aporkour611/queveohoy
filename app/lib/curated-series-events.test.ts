import { describe, expect, it } from "vitest";
import { pickWeekDestacados } from "./destacados-config";
import { mergeCuratedSeriesEvents } from "./curated-series-events";

describe("mergeCuratedSeriesEvents", () => {
  it("inserta FROM y Euphoria con póster y horario", () => {
    const events = mergeCuratedSeriesEvents([], "2026-05-27", 7);
    const from = events.find((event) => /^from\b/i.test(event.title ?? ""));
    const euphoria = events.find((event) => /^euphoria\b/i.test(event.title ?? ""));

    expect(from).toMatchObject({
      date: "2026-05-31",
      time: "22:00",
      sport: "series",
      platform: "Prime Video",
    });
    expect(from?.source).toContain("pRtJagIxpfODzzb0T0NAvZSzErC");

    expect(euphoria).toMatchObject({
      date: "2026-05-31",
      time: "23:00",
      sport: "series",
      platform: "HBO Max",
    });
    expect(euphoria?.source).toContain("6Sdm5XwdCnspdEF8fTFx6UJrl7o");
  });
});

describe("pickWeekDestacados", () => {
  it("incluye FROM antes que Euphoria por orden cronológico", () => {
    const week = pickWeekDestacados([], {
      todayKey: "2026-05-27",
      windowDays: 7,
    });

    const fromIndex = week.findIndex((event) => /^from\b/i.test(event.title ?? ""));
    const euphoriaIndex = week.findIndex((event) =>
      /^euphoria\b/i.test(event.title ?? "")
    );

    expect(fromIndex).toBeGreaterThanOrEqual(0);
    expect(euphoriaIndex).toBeGreaterThan(fromIndex);
  });
});

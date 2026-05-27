import { describe, expect, it } from "vitest";
import {
  pickWeekDestacados,
  sortDestacadosBySoonest,
} from "./destacados-config";
import { mergeCuratedSeriesEvents } from "./curated-series-events";

describe("mergeCuratedSeriesEvents", () => {
  it("inserta FROM y Euphoria con estreno España (lunes de madrugada)", () => {
    const events = mergeCuratedSeriesEvents([], "2026-05-27", 7);
    const from = events.find((event) => /^from\b/i.test(event.title ?? ""));
    const euphoria = events.find((event) => /^euphoria\b/i.test(event.title ?? ""));

    expect(from).toMatchObject({
      date: "2026-06-01",
      time: "03:00",
      sport: "series",
      platform: "HBO Max",
    });
    expect(from?.source).toContain("pRtJagIxpfODzzb0T0NAvZSzErC");

    expect(euphoria).toMatchObject({
      date: "2026-06-01",
      time: "03:00",
      sport: "series",
      platform: "HBO Max",
    });
    expect(euphoria?.source).toContain("6Sdm5XwdCnspdEF8fTFx6UJrl7o");
  });
});

describe("pickWeekDestacados", () => {
  it("ordena esta semana cronológicamente (fecha y hora Madrid)", () => {
    const week = pickWeekDestacados([], {
      todayKey: "2026-05-27",
      windowDays: 7,
    });

    for (let i = 1; i < week.length; i++) {
      expect(sortDestacadosBySoonest(week[i - 1], week[i])).toBeLessThanOrEqual(0);
    }

    const fromIndex = week.findIndex((event) => /^from\b/i.test(event.title ?? ""));
    const euphoriaIndex = week.findIndex((event) =>
      /^euphoria\b/i.test(event.title ?? "")
    );

    expect(fromIndex).toBeGreaterThanOrEqual(0);
    expect(euphoriaIndex).toBeGreaterThanOrEqual(0);
  });
});

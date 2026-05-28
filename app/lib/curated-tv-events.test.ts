import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import {
  mergeCuratedSpanishTvEvents,
  shouldSuppressMisdatedSpanishTvEvent,
  stripDuplicateGenericSpanishTvEvents,
} from "./curated-tv-events";
import { normalizeFeedEvents } from "./events-feed";

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

  it("inserta Mask Singer los miércoles a las 23:00 con póster editorial", () => {
    const events = mergeCuratedSpanishTvEvents([], "2026-05-27", 7);
    const maskSinger = events.find((event) => /mask singer/i.test(event.title ?? ""));

    expect(maskSinger).toBeDefined();
    expect(maskSinger?.date).toBe("2026-05-27");
    expect(maskSinger?.time).toBe("23:00");
    expect(maskSinger?.platform).toContain("Antena 3");
    expect(maskSinger?.platform).toContain("ATRESPLAYER TV");
  });

  it("prioriza plataforma curada sobre TMDB para Mask Singer", () => {
    const events = mergeCuratedSpanishTvEvents(
      [
        {
          id: 99,
          external_id: "tmdb_tv_reality_1_2026-05-27_s1e1",
          title: "Mask Singer",
          date: "2026-05-27",
          time: "22:00",
          sport: "tv",
          competition: "Reality",
          platform: "Netflix",
          source: "tmdb",
        },
      ],
      "2026-05-27",
      7
    );
    const maskSinger = events.find((event) => /mask singer/i.test(event.title ?? ""));

    expect(maskSinger?.platform).toBe("Antena 3 · ATRESPLAYER TV");
  });

  it("suprime La Isla T10E25 en lunes y conserva lunes/martes correctos", () => {
    const events: EventRow[] = [
      {
        id: 1,
        external_id: "tmdb_tv_reality_95676_2026-06-01_s10e24",
        title: "La Isla de las Tentaciones — T10E24",
        date: "2026-06-01",
        time: "23:00",
        sport: "tv",
        competition: "Reality · La Isla de las Tentaciones",
        platform: "Telecinco · Mitele",
        source: "tmdb",
      },
      {
        id: 2,
        external_id: "tmdb_tv_reality_95676_2026-06-01_s10e25",
        title: "La Isla de las Tentaciones — T10E25",
        date: "2026-06-01",
        time: "23:00",
        sport: "tv",
        competition: "Reality · La Isla de las Tentaciones",
        platform: "Telecinco · Mitele",
        source: "tmdb",
      },
      {
        id: 3,
        external_id: "tmdb_tv_reality_95676_2026-06-02_s10e25",
        title: "La Isla de las Tentaciones — T10E25",
        date: "2026-06-02",
        time: "23:00",
        sport: "tv",
        competition: "Reality · La Isla de las Tentaciones",
        platform: "Telecinco · Mitele",
        source: "tmdb",
      },
    ];

    expect(shouldSuppressMisdatedSpanishTvEvent(events[1])).toBe(true);
    expect(shouldSuppressMisdatedSpanishTvEvent(events[2])).toBe(false);

    const normalized = normalizeFeedEvents(events);
    expect(normalized.some((event) => event.date === "2026-06-01" && /T10E25/i.test(event.title ?? ""))).toBe(false);
    expect(normalized.some((event) => event.date === "2026-06-02" && /T10E25/i.test(event.title ?? ""))).toBe(true);
  });

  it("elimina título genérico de La Isla si ya hay episodio ese día", () => {
    const events: EventRow[] = [
      {
        id: 1,
        external_id: "curated_tv_isla-tentaciones_2026-06-01",
        title: "La Isla de las Tentaciones",
        date: "2026-06-01",
        time: "23:00",
        sport: "tv",
        competition: "Reality · La Isla de las Tentaciones",
        platform: "Telecinco · Mitele",
        source: "tmdb",
      },
      {
        id: 2,
        external_id: "tmdb_tv_reality_95676_2026-06-01_s10e24",
        title: "La Isla de las Tentaciones — T10E24",
        date: "2026-06-01",
        time: "23:00",
        sport: "tv",
        competition: "Reality · La Isla de las Tentaciones",
        platform: "Telecinco · Mitele",
        source: "tmdb",
      },
    ];

    const stripped = stripDuplicateGenericSpanishTvEvents(events);
    expect(stripped).toHaveLength(1);
    expect(stripped[0]?.title).toContain("T10E24");
  });
});

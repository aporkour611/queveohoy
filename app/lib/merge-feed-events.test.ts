import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { mergeFeedEvents, pruneFeedEventsToWindow } from "./merge-feed-events";
import { getMadridTodayKey } from "./seo-date";

describe("mergeFeedEvents", () => {
  it("conserva eventos SSR si la respuesta nueva viene vacía", () => {
    const previous: EventRow[] = [
      { id: 1, title: "Partido A", date: "2026-05-27", time: "21:00" },
    ];

    expect(mergeFeedEvents(previous, [])).toEqual(previous);
  });

  it("fusiona por id priorizando los datos nuevos", () => {
    const previous: EventRow[] = [
      { id: 1, title: "Antiguo", date: "2026-05-27", time: "21:00" },
      { id: 2, title: "Solo SSR", date: "2026-05-28", time: "18:00" },
    ];
    const incoming: EventRow[] = [
      { id: 1, title: "Actualizado", date: "2026-05-27", time: "21:00" },
      { id: 3, title: "Nuevo", date: "2026-05-29", time: "20:00" },
    ];

    const merged = mergeFeedEvents(previous, incoming);
    expect(merged.map((event) => event.id)).toEqual([1, 2, 3]);
    expect(merged.find((event) => event.id === 1)?.title).toBe("Actualizado");
  });

  it("fusiona por external_id evitando duplicados al recargar", () => {
    const previous: EventRow[] = [
      {
        id: 10,
        external_id: "football_1",
        title: "Partido SSR",
        date: "2026-05-27",
        time: "21:00",
      },
    ];
    const incoming: EventRow[] = [
      {
        id: 99,
        external_id: "football_1",
        title: "Partido API",
        date: "2026-05-27",
        time: "21:00",
      },
      {
        id: 11,
        external_id: "football_2",
        title: "Otro partido",
        date: "2026-05-28",
        time: "18:00",
      },
    ];

    const merged = mergeFeedEvents(previous, incoming);
    expect(merged).toHaveLength(2);
    expect(merged.find((event) => event.external_id === "football_1")?.id).toBe(
      99
    );
    expect(merged.find((event) => event.external_id === "football_1")?.title).toBe(
      "Partido API"
    );
  });

  it("poda eventos fuera de la ventana de 7 días Madrid", () => {
    const today = getMadridTodayKey();
    const events: EventRow[] = [
      { id: 1, title: "Viejo", date: "2020-01-01", time: "21:00" },
      { id: 2, title: "Hoy", date: today, time: "21:00" },
    ];

    const pruned = pruneFeedEventsToWindow(events, 7, "Europe/Madrid");
    expect(pruned.map((event) => event.id)).toEqual([2]);
  });
});

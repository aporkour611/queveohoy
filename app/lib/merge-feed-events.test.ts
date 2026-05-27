import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { mergeFeedEvents } from "./merge-feed-events";

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
});

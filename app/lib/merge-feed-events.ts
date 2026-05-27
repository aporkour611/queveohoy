import type { EventRow } from "../components/types";

/** Combina feed previo (SSR) con datos nuevos sin perder eventos visibles. */
export function mergeFeedEvents(
  previous: EventRow[],
  incoming: EventRow[]
): EventRow[] {
  const byId = new Map<number, EventRow>();

  for (const event of incoming) {
    byId.set(event.id, event);
  }
  for (const event of previous) {
    if (!byId.has(event.id)) {
      byId.set(event.id, event);
    }
  }

  return [...byId.values()].sort((a, b) => {
    const byDate = (a.date ?? "").localeCompare(b.date ?? "");
    if (byDate !== 0) return byDate;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });
}

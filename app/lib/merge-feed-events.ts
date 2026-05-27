import type { EventRow } from "../components/types";

function sortFeedEvents(events: EventRow[]): EventRow[] {
  return [...events].sort((a, b) => {
    const byDate = (a.date ?? "").localeCompare(b.date ?? "");
    if (byDate !== 0) return byDate;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });
}

/** Combina feed previo (SSR) con datos nuevos sin perder eventos visibles. */
export function mergeFeedEvents(
  previous: EventRow[],
  incoming: EventRow[]
): EventRow[] {
  const byId = new Map<number, EventRow>();
  const externalToId = new Map<string, number>();

  const remember = (event: EventRow) => {
    byId.set(event.id, event);
    const externalId = event.external_id?.trim();
    if (externalId) externalToId.set(externalId, event.id);
  };

  for (const event of previous) {
    remember(event);
  }

  for (const event of incoming) {
    const externalId = event.external_id?.trim();
    if (externalId && externalToId.has(externalId)) {
      const existingId = externalToId.get(externalId)!;
      if (existingId !== event.id) {
        byId.delete(existingId);
      }
    }
    remember(event);
  }

  return sortFeedEvents([...byId.values()]);
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { EventRow } from "./types";
import { filterEventsByQuery } from "../lib/event-search";
import { partidoPath } from "../lib/event-slug";
import { eventLabel } from "../lib/seo-events";
import { eventDisplayTime } from "../lib/madrid-time";
import { resolveChannelsForEvent } from "../lib/channels";

type Props = {
  events: EventRow[];
  onPickDay?: (date: string) => void;
  onQueryChange?: (query: string) => void;
};

export function EventSearch({ events, onPickDay, onQueryChange }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => filterEventsByQuery(events, query),
    [events, query]
  );

  const active = query.trim().length >= 2;

  return (
    <div className="qvh-event-search">
      <label className="qvh-event-search-label" htmlFor="qvh-event-search-input">
        Buscar
      </label>
      <input
        id="qvh-event-search-input"
        type="search"
        className="qvh-event-search-input"
        placeholder="Equipo, competición o canal…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onQueryChange?.(e.target.value);
        }}
        autoComplete="off"
        enterKeyHint="search"
      />

      {active && results.length === 0 ? (
        <p className="qvh-event-search-empty">Sin resultados para «{query.trim()}»</p>
      ) : null}

      {active && results.length > 0 ? (
        <ul className="qvh-event-search-results" aria-live="polite">
          {results.slice(0, 12).map((event) => {
            const channels = resolveChannelsForEvent(event);
            const channel = channels[0];
            const timeLabel = eventDisplayTime(event);
            return (
              <li key={event.id}>
                <Link
                  href={partidoPath(event)}
                  className="qvh-event-search-hit"
                  onClick={() => {
                    if (event.date) onPickDay?.(event.date);
                  }}
                >
                  <span className="qvh-event-search-hit-title">
                    {eventLabel(event)}
                  </span>
                  <span className="qvh-event-search-hit-meta">
                    {event.competition?.split(" · ")[0]}
                    {timeLabel ? ` · ${timeLabel}` : ""}
                    {channel ? ` · ${channel}` : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

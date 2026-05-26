"use client";

import { useEffect, useState } from "react";
import type { UfcEvent } from "../lib/thesportsdb-ufc";
import { kindLabel } from "../lib/thesportsdb-ufc";
import { displayTime } from "../lib/madrid-time";

export function UfcUpcoming() {
  const [events, setEvents] = useState<UfcEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ufc");
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "No se pudieron cargar eventos UFC");
        }
        if (!cancelled) setEvents(data.events ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error desconocido");
          setEvents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="ufc-section" aria-label="Próximos eventos UFC">
        <div className="ufc-section-head">
          <div className="ufc-section-brand">
            <span className="ufc-section-dot" aria-hidden />
            <h2 className="ufc-section-title">UFC</h2>
          </div>
        </div>
        <div className="ufc-skeleton-row">
          {[0, 1, 2].map((i) => (
            <div key={i} className="ufc-card ufc-card-skeleton" aria-hidden />
          ))}
        </div>
      </section>
    );
  }

  if (error || events.length === 0) return null;

  return (
    <section className="ufc-section" aria-label="Próximos eventos UFC">
      <div className="ufc-section-head">
        <div className="ufc-section-brand">
          {events[0]?.badge ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={events[0].badge}
              alt=""
              className="ufc-section-badge"
            />
          ) : (
            <span className="ufc-section-dot" aria-hidden />
          )}
          <div>
            <h2 className="ufc-section-title">Próximos UFC</h2>
            <p className="ufc-section-sub">Lo más cercano en calendario</p>
          </div>
        </div>
      </div>

      <div className="ufc-scroll">
        {events.map((event) => (
          <article key={event.id} className="ufc-card">
            <div
              className="ufc-card-visual"
              style={
                event.poster || event.thumb
                  ? {
                      backgroundImage: `url(${event.poster || event.thumb})`,
                    }
                  : undefined
              }
            >
              <div className="ufc-card-overlay" />
              <span className={`ufc-card-kind ufc-card-kind-${event.kind}`}>
                {kindLabel(event.kind)}
              </span>
              <div className="ufc-card-date">
                <span className="ufc-card-date-label">{event.dateLabel}</span>
                <span className="ufc-card-time">{displayTime(event.time)}</span>
              </div>
            </div>

            <div className="ufc-card-body">
              <h3 className="ufc-card-headline">{event.headline}</h3>
              <p className="ufc-card-meta">
                {event.venue}
                {event.location ? ` · ${event.location}` : ""}
              </p>
              <p className="ufc-card-platform">{event.platform}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

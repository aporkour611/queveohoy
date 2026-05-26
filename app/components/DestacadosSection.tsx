import type { EventRow } from "./types";
import { pickFeaturedEvents } from "../lib/featured";
import { FeaturedEventCard } from "./FeaturedEventCard";

type Props = {
  events: EventRow[];
  date: string;
};

export function DestacadosSection({ events, date }: Props) {
  const featured = pickFeaturedEvents(events.filter((e) => e.date === date));

  if (!featured.length) return null;

  return (
    <section className="qvh-destacados" aria-label="Destacados">
      <div className="qvh-destacados-head">
        <div className="qvh-destacados-brand">
          <span className="qvh-destacados-dot" aria-hidden />
          <div>
            <h2 className="qvh-destacados-title">Destacados</h2>
            <p className="qvh-destacados-sub">Lo más top de cada categoría</p>
          </div>
        </div>
      </div>

      <div className="qvh-destacados-scroll">
        {featured.map((event) => (
          <FeaturedEventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

"use client";

import { useMemo } from "react";
import type { EventRow } from "./types";
import {
  pickLiveNowDestacados,
  pickWeekDestacados,
} from "../lib/destacados-config";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { useLiveClock } from "../lib/use-live-clock";
import { DestacadosCarousel } from "./DestacadosCarousel";

type Props = {
  events: EventRow[];
};

function DestacadosRow({
  title,
  subtitle,
  items,
  ariaLabel,
  className,
  layout = "paginated",
}: {
  title: string;
  subtitle: string;
  items: EventRow[];
  ariaLabel: string;
  className?: string;
  layout?: "paginated" | "scroll";
}) {
  if (items.length === 0) return null;

  return (
    <section
      className={`qvh-destacados${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
    >
      <div className="qvh-destacados-head">
        <div className="qvh-destacados-brand">
          <span className="qvh-destacados-dot" aria-hidden />
          <div>
            <h2 className="qvh-destacados-title">{title}</h2>
            <p className="qvh-destacados-sub">{subtitle}</p>
          </div>
        </div>
      </div>

      <DestacadosCarousel items={items} ariaLabel={ariaLabel} layout={layout} />
    </section>
  );
}

export function DestacadosSection({ events }: Props) {
  const now = useLiveClock(30_000);
  const todayKey = useMemo(
    () => buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0]?.date ?? "",
    []
  );

  const liveFeatured = useMemo(
    () => pickLiveNowDestacados(events, { todayKey, now }),
    [events, todayKey, now]
  );

  const weekFeatured = useMemo(() => {
    const excludeIds = new Set(liveFeatured.map((event) => event.id));
    return pickWeekDestacados(events, { todayKey, excludeIds });
  }, [events, todayKey, liveFeatured]);

  if (liveFeatured.length === 0 && weekFeatured.length === 0) return null;

  const hasLive = liveFeatured.length > 0;

  return (
    <div className="qvh-destacados-stack">
      {hasLive ? (
        <DestacadosRow
          title="En vivo ahora"
          subtitle="Retransmisión en directo en TV y streaming gratis"
          items={liveFeatured}
          ariaLabel="En vivo ahora"
          className="qvh-destacados-live"
        />
      ) : null}
      <DestacadosRow
        title="Esta semana"
        subtitle="Final de Champions, estrenos y series que marcan"
        items={weekFeatured}
        ariaLabel="Destacados de la semana"
        className={
          hasLive ? "qvh-destacados-week" : "qvh-destacados-week qvh-destacados-week-first"
        }
      />
    </div>
  );
}

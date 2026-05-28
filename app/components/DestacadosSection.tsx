"use client";

import { memo, useMemo } from "react";
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

function DestacadosLiveBlock({
  events,
  todayKey,
}: {
  events: EventRow[];
  todayKey: string;
}) {
  const now = useLiveClock(60_000);
  const liveFeatured = useMemo(
    () => pickLiveNowDestacados(events, { todayKey, now }),
    [events, todayKey, now]
  );

  if (liveFeatured.length === 0) return null;

  return (
    <DestacadosRow
      title="En vivo ahora"
      subtitle="Retransmisión en directo en TV y streaming gratis"
      items={liveFeatured}
      ariaLabel="En vivo ahora"
      className="qvh-destacados-live"
    />
  );
}

export const DestacadosSection = memo(function DestacadosSection({ events }: Props) {
  const todayKey = useMemo(
    () => buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0]?.date ?? "",
    []
  );

  const { weekFeatured, hasLive } = useMemo(() => {
    const liveNow = pickLiveNowDestacados(events, { todayKey, now: new Date() });
    const liveIds = new Set(liveNow.map((event) => event.id));
    return {
      hasLive: liveNow.length > 0,
      weekFeatured: pickWeekDestacados(events, { todayKey, excludeIds: liveIds }),
    };
  }, [events, todayKey]);

  if (!hasLive && weekFeatured.length === 0) return null;

  return (
    <div className="qvh-destacados-stack">
      <DestacadosLiveBlock events={events} todayKey={todayKey} />
      {weekFeatured.length > 0 ? (
        <DestacadosRow
          title="Esta semana"
          subtitle="Final de Champions, estrenos y series que marcan"
          items={weekFeatured}
          ariaLabel="Destacados de la semana"
          className={
            hasLive
              ? "qvh-destacados-week"
              : "qvh-destacados-week qvh-destacados-week-first"
          }
        />
      ) : null}
    </div>
  );
});

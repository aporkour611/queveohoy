"use client";

import { memo, useMemo } from "react";
import type { EventRow } from "./types";
import { pickWeekDestacados } from "../lib/destacados-config";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
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

export const DestacadosSection = memo(function DestacadosSection({ events }: Props) {
  const todayKey = useMemo(
    () => buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0]?.date ?? "",
    []
  );

  const weekFeatured = useMemo(
    () => pickWeekDestacados(events, { todayKey }),
    [events, todayKey]
  );

  if (weekFeatured.length === 0) return null;

  return (
    <div className="qvh-destacados-stack">
      <DestacadosRow
        title="Esta semana"
        subtitle="Final de Champions, estrenos y series que marcan"
        items={weekFeatured}
        ariaLabel="Destacados de la semana"
        className="qvh-destacados-week qvh-destacados-week-first"
      />
    </div>
  );
});

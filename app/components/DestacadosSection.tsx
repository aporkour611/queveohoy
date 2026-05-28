import type { EventRow } from "./types";
import {
  pickTodayDestacados,
  pickWeekDestacados,
  DESTACADOS_VISIBLE_SLOTS,
} from "../lib/destacados-config";
import { resolveChampionsWeekContext } from "../lib/champions-week";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { ChampionsWeekHero } from "./ChampionsWeekHero";
import { DestacadosCarousel } from "./DestacadosCarousel";
import { FeaturedEventCard } from "./FeaturedEventCard";

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

      <DestacadosCarousel ariaLabel={ariaLabel} layout={layout}>
        {items.map((event, index) => (
          <FeaturedEventCard
            key={event.id}
            event={event}
            priority={index < DESTACADOS_VISIBLE_SLOTS}
          />
        ))}
      </DestacadosCarousel>
    </section>
  );
}

export function DestacadosSection({ events }: Props) {
  const todayKey = buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0]?.date ?? "";
  const todayFeatured = pickTodayDestacados(events, { todayKey });
  const weekFeatured = pickWeekDestacados(events, {
    todayKey,
    excludeIds: new Set(todayFeatured.map((event) => event.id)),
  });
  const championsWeek = resolveChampionsWeekContext(
    events,
    todayKey,
    FEED_DAY_COUNT
  );

  if (todayFeatured.length === 0 && weekFeatured.length === 0) return null;

  const todayRow =
    todayFeatured.length > 0 ? (
      <DestacadosRow
        title="Hoy"
        subtitle="Lo más relevante de la parrilla de hoy"
        items={todayFeatured}
        ariaLabel="Destacados de hoy"
        className="qvh-destacados-today"
      />
    ) : null;

  const weekRow =
    weekFeatured.length > 0 ? (
      <DestacadosRow
        title="Esta semana"
        subtitle={
          championsWeek
            ? "La gran final y lo más esperado del fin de semana"
            : "Estrenos, finales y series que marcan la semana"
        }
        items={weekFeatured}
        ariaLabel="Destacados de la semana"
        className={`qvh-destacados-week qvh-destacados-week-first${
          championsWeek ? " qvh-cl-week-destacados" : ""
        }`}
      />
    ) : null;

  return (
    <div className="qvh-destacados-stack">
      {championsWeek ? (
        <div className="qvh-cl-week-shell">
          <ChampionsWeekHero context={championsWeek} />
          {todayRow}
          {weekRow}
        </div>
      ) : (
        <>
          {todayRow}
          {weekRow}
        </>
      )}
    </div>
  );
}

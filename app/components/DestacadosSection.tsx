import type { EventRow } from "./types";
import { pickWeekDestacados, DESTACADOS_VISIBLE_SLOTS } from "../lib/destacados-config";
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
  const weekFeatured = pickWeekDestacados(events, { todayKey });
  const championsWeek = resolveChampionsWeekContext(
    events,
    todayKey,
    FEED_DAY_COUNT
  );

  if (weekFeatured.length === 0) return null;

  const weekRow = (
    <DestacadosRow
      title="Esta semana"
      subtitle={
        championsWeek
          ? "La gran final y lo más esperado del fin de semana"
          : "Final de Champions, estrenos y series que marcan"
      }
      items={weekFeatured}
      ariaLabel="Destacados de la semana"
      className={`qvh-destacados-week qvh-destacados-week-first${
        championsWeek ? " qvh-cl-week-destacados" : ""
      }`}
    />
  );

  return (
    <div className="qvh-destacados-stack">
      {championsWeek ? (
        <div className="qvh-cl-week-shell">
          <ChampionsWeekHero context={championsWeek} />
          {weekRow}
        </div>
      ) : (
        weekRow
      )}
    </div>
  );
}

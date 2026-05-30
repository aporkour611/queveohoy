import { QUICK_FILTERS } from "../lib/filter-config";

type DayTab = {
  date: string;
  label: string;
  num: number;
  month: string;
};

type Props = {
  days: DayTab[];
};

/** Shell SSR estático — sin botones (PSI no dispara hidratación). */
export function FeedControlsShell({ days }: Props) {
  return (
    <section
      id="feed-controls-ssr"
      className="qvh-feed-controls qvh-feed-controls-ssr"
      aria-label="Calendario y filtros de la agenda"
    >
      <div className="qvh-day-tabs" role="tablist" aria-label="Días de la agenda">
        {days.map((day, index) => (
          <div
            key={day.date}
            role="tab"
            aria-selected={index === 0}
            className={`qvh-day-tab${index === 0 ? " active" : ""}`}
          >
            <span className="qvh-day-tab-label">{day.label}</span>
            <span className="qvh-day-tab-date">
              {day.num} {day.month.toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      <div className="qvh-feed-controls-toolbar">
        <div className="qvh-feed-view-toggle">
          <span className="qvh-feed-view-toggle-btn qvh-feed-view-toggle-btn-active">
            Hoy
          </span>
          <span className="qvh-feed-view-toggle-btn">Semana completa</span>
        </div>

        <div className="qvh-feed-controls-divider" aria-hidden />

        <div className="qvh-feed-filters">
          <div
            className="fh-quick-filters fh-quick-filters-toolbar"
            role="group"
            aria-label="Filtros rápidos"
            tabIndex={0}
          >
            {QUICK_FILTERS.map((quick, index) => (
              <span
                key={quick.id}
                className={`fh-quick-filter${index === 0 ? " active" : ""}`}
              >
                {quick.label}
              </span>
            ))}
            <span className="fh-quick-filter fh-quick-filter-more">Más</span>
          </div>
        </div>
      </div>

      <p className="qvh-feed-hydrate-hint">
        <button
          type="button"
          data-qvh-hydrate-feed
          className="qvh-feed-hydrate-cta"
          aria-label="Activar filtros y calendario interactivo de la agenda"
        >
          Activar filtros y calendario interactivo
        </button>
      </p>
    </section>
  );
}

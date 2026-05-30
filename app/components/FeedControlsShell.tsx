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

/** Calendario/filtros SSR — botones activan hidratación del feed al interactuar. */
export function FeedControlsShell({ days }: Props) {
  return (
    <section
      id="feed-controls-ssr"
      className="qvh-feed-controls qvh-feed-controls-ssr"
      aria-busy="true"
      aria-label="Calendario y filtros de la agenda"
    >
      <div className="qvh-day-tabs" role="tablist" aria-label="Días de la agenda">
        {days.map((day, index) => (
          <button
            key={day.date}
            type="button"
            role="tab"
            data-qvh-feed-activate
            aria-selected={index === 0}
            className={`qvh-day-tab${index === 0 ? " active" : ""}`}
          >
            <span className="qvh-day-tab-label">{day.label}</span>
            <span className="qvh-day-tab-date">
              {day.num} {day.month.toLowerCase()}
            </span>
          </button>
        ))}
      </div>

      <div className="qvh-feed-controls-toolbar">
        <div className="qvh-feed-view-toggle">
          <span className="qvh-feed-view-toggle-btn qvh-feed-view-toggle-btn-active">
            Hoy
          </span>
          <button
            type="button"
            data-qvh-week-view
            data-qvh-feed-activate
            className="qvh-feed-view-toggle-btn"
          >
            Semana completa
          </button>
        </div>

        <div className="qvh-feed-controls-divider" aria-hidden />

        <div className="qvh-feed-filters">
          <div className="fh-quick-filters fh-quick-filters-toolbar">
            {QUICK_FILTERS.map((quick, index) => (
              <button
                key={quick.id}
                type="button"
                data-qvh-feed-activate
                className={`fh-quick-filter${index === 0 ? " active" : ""}`}
              >
                {quick.label}
              </button>
            ))}
            <button type="button" data-qvh-feed-activate className="fh-quick-filter fh-quick-filter-more">
              Más
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

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

/** Placeholder visual del calendario/filtros antes de hidratar FeedControls. */
export function FeedControlsShell({ days }: Props) {
  return (
    <section
      id="feed-controls-ssr"
      className="qvh-feed-controls qvh-feed-controls-ssr"
      aria-hidden="true"
    >
      <div className="qvh-day-tabs">
        {days.map((day, index) => (
          <div
            key={day.date}
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
          <div className="fh-quick-filters fh-quick-filters-toolbar">
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
    </section>
  );
}

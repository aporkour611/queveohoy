"use client";

import { DayTabs } from "./DayTabs";
import { EventFilters } from "./EventFilters";

type DayTab = {
  date: string;
  label: string;
  num: number;
  month: string;
};

type Props = {
  days: DayTab[];
  activeDayIndex: number;
  onDayChange: (index: number) => void;
  weekView: boolean;
  onSelectTodayView: () => void;
  onSelectWeekView: () => void;
  selectedSports: string[];
  onFilterChange: (ids: string[]) => void;
  isFeaturedMode: boolean;
};

export function FeedControls({
  days,
  activeDayIndex,
  onDayChange,
  weekView,
  onSelectTodayView,
  onSelectWeekView,
  selectedSports,
  onFilterChange,
  isFeaturedMode,
}: Props) {
  return (
    <section
      id="feed-controls"
      className="qvh-feed-controls"
      aria-label="Calendario y filtros"
    >
      <DayTabs days={days} activeIndex={activeDayIndex} onChange={onDayChange} />

      <div className="qvh-feed-controls-toolbar">
        <div
          className="qvh-feed-view-toggle"
          role="group"
          aria-label="Vista del calendario"
        >
          <button
            type="button"
            className={`qvh-feed-view-toggle-btn${!weekView ? " qvh-feed-view-toggle-btn-active" : ""}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onSelectTodayView}
            aria-pressed={!weekView}
          >
            Hoy
          </button>
          <button
            type="button"
            className={`qvh-feed-view-toggle-btn${weekView ? " qvh-feed-view-toggle-btn-active" : ""}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onSelectWeekView}
            aria-pressed={weekView}
          >
            Semana completa
          </button>
        </div>

        <div className="qvh-feed-controls-divider" aria-hidden />

        <EventFilters
          variant="toolbar"
          selected={selectedSports}
          onChange={onFilterChange}
          isFeaturedMode={isFeaturedMode}
        />
      </div>
    </section>
  );
}

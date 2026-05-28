"use client";

import { useLayoutEffect, useState } from "react";
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
  onPrefetchWeekView?: () => void;
  selectedSports: string[];
  onFilterChange: (ids: string[]) => void;
  isFeaturedMode: boolean;
};

function CollapseFiltersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M7 14l5-5 5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeedControls({
  days,
  activeDayIndex,
  onDayChange,
  weekView,
  onSelectTodayView,
  onSelectWeekView,
  onPrefetchWeekView,
  selectedSports,
  onFilterChange,
  isFeaturedMode,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  useLayoutEffect(() => {
    const el = document.getElementById("feed-controls");
    if (!el) return;

    const syncHeight = () => {
      document.documentElement.style.setProperty(
        "--qvh-feed-controls-h",
        `${el.offsetHeight}px`
      );
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtersOpen]);

  return (
    <section
      id="feed-controls"
      className="qvh-feed-controls"
      aria-label="Calendario y filtros"
    >
      <DayTabs days={days} activeIndex={activeDayIndex} onChange={onDayChange} />

      <div
        className={`qvh-feed-controls-toolbar${filtersOpen ? " is-filters-open" : ""}`}
      >
        <div className="qvh-feed-controls-sidebar">
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
              onMouseEnter={onPrefetchWeekView}
              onFocus={onPrefetchWeekView}
              onClick={onSelectWeekView}
              aria-pressed={weekView}
            >
              Semana completa
            </button>
          </div>

          {filtersOpen ? (
            <button
              type="button"
              className="qvh-feed-filters-collapse"
              onClick={() => setFiltersOpen(false)}
              aria-label="Ocultar filtros detallados"
              title="Ocultar filtros"
            >
              <CollapseFiltersIcon />
            </button>
          ) : null}
        </div>

        <div className="qvh-feed-controls-divider" aria-hidden />

        <EventFilters
          variant="toolbar"
          selected={selectedSports}
          onChange={onFilterChange}
          isFeaturedMode={isFeaturedMode}
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
        />
      </div>
    </section>
  );
}

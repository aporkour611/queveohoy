"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { deferClientStateUpdate } from "../lib/defer-client-state";
import { AgendaSearchBar } from "./AgendaSearchBar";
import { DayTabs } from "./DayTabs";
import { EventFilters } from "./EventFilters";

const FILTER_NUDGE_KEY = "qvh_filter_nudge_dismissed_v2";

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
  onFilterSearch: (ids: string[]) => void;
  isFeaturedMode: boolean;
  filterSearching?: boolean;
  agendaQuery?: string;
  onAgendaQueryChange?: (value: string) => void;
  agendaResultCount?: number;
  agendaTotalCount?: number;
};

function CollapseFiltersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <path
        d="M14 7l-5 5 5 5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterDiscoverNudge({
  onOpen,
  onDismiss,
}: {
  onOpen: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="qvh-filter-nudge"
      role="dialog"
      aria-labelledby="qvh-filter-nudge-title"
      aria-describedby="qvh-filter-nudge-text"
    >
      <button
        type="button"
        className="qvh-filter-nudge-dismiss"
        onClick={onDismiss}
        aria-label="Cerrar aviso de filtros"
      >
        ×
      </button>
      <p id="qvh-filter-nudge-title" className="qvh-filter-nudge-title">
        ¿Qué quieres ver hoy?
      </p>
      <p id="qvh-filter-nudge-text" className="qvh-filter-nudge-text">
        Filtra deportes, series, TV y más para ver solo lo que te interesa.
      </p>
      <button type="button" className="qvh-filter-nudge-cta" onClick={onOpen}>
        Elegir filtros
      </button>
    </div>
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
  onFilterSearch,
  isFeaturedMode,
  filterSearching = false,
  agendaQuery = "",
  onAgendaQueryChange,
  agendaResultCount,
  agendaTotalCount,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [nudgeReady, setNudgeReady] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(true);

  useEffect(() => {
    deferClientStateUpdate(() => {
      try {
        setNudgeDismissed(localStorage.getItem(FILTER_NUDGE_KEY) === "1");
      } catch {
        setNudgeDismissed(false);
      }
    });

    const timer = window.setTimeout(() => setNudgeReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    const el = document.getElementById("feed-controls");
    if (!el) return;

    document.getElementById("feed-controls-ssr")?.setAttribute("hidden", "");

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
  }, [filtersOpen, nudgeReady, nudgeDismissed]);

  const handleDismissNudge = () => {
    setNudgeDismissed(true);
    try {
      localStorage.setItem(FILTER_NUDGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const handleOpenFiltersFromNudge = () => {
    handleDismissNudge();
    setFiltersOpen(true);
  };

  const showDiscoverNudge =
    nudgeReady && !nudgeDismissed && !filtersOpen && isFeaturedMode;

  const highlightDiscover =
    nudgeReady && !nudgeDismissed && !filtersOpen && isFeaturedMode;

  return (
    <section
      id="feed-controls"
      className="qvh-feed-controls"
      aria-label="Calendario y filtros"
    >
      <DayTabs days={days} activeIndex={activeDayIndex} onChange={onDayChange} />

      {onAgendaQueryChange ? (
        <AgendaSearchBar
          value={agendaQuery}
          onChange={onAgendaQueryChange}
          resultCount={agendaResultCount}
          totalCount={agendaTotalCount}
        />
      ) : null}

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
              <span className="qvh-feed-filters-collapse-label">Ocultar</span>
            </button>
          ) : null}
        </div>

        <div className="qvh-feed-controls-divider" aria-hidden />

        <div className="qvh-feed-filters-wrap">
          {showDiscoverNudge ? (
            <FilterDiscoverNudge
              onOpen={handleOpenFiltersFromNudge}
              onDismiss={handleDismissNudge}
            />
          ) : null}

          <EventFilters
            variant="toolbar"
            selected={selectedSports}
            onSearch={onFilterSearch}
            isFeaturedMode={isFeaturedMode}
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            searching={filterSearching}
            highlightDiscover={highlightDiscover}
          />
        </div>
      </div>
    </section>
  );
}

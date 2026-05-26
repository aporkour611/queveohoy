"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./lib/supabase";
import { dedupeEvents } from "./lib/dedupe-events";
import { filterEventsForDisplay } from "./lib/event-crests";
import { LEGEND_ITEMS, STORAGE_KEY, sportLabel } from "./lib/filter-config";
import { DayTabs } from "./components/DayTabs";
import { EventFilters } from "./components/EventFilters";
import { LoadingState } from "./components/LoadingState";
import { AdminNavLink } from "./components/AdminNavLink";
import { Logo } from "./components/Logo";
import { MatchCard } from "./components/MatchCard";
import { SiteFooter } from "./components/SiteFooter";
import type { EventRow } from "./components/types";
import { competitionAccentClass, sportAccentClass } from "./lib/sport-accent";
import {
  formatMadridMonthShort,
  formatMadridWeekday,
  getMadridWeekDates,
  madridDayNumber,
  madridDayTitle,
} from "./lib/madrid-time";
import { resolveDayEventsForFeed } from "./lib/upcoming-events";

const FEED_DAY_COUNT = 7;

const ALL_DAYS = getMadridWeekDates(FEED_DAY_COUNT).map((date, i) => {
  const weekday = formatMadridWeekday(date, "short");
  const month = formatMadridMonthShort(date);
  return {
    label:
      i === 0 ? "Hoy" : i === 1 ? "Mañana" : weekday.charAt(0).toUpperCase() + weekday.slice(1, 3),
    date,
    num: madridDayNumber(date),
    month: month.charAt(0).toUpperCase() + month.slice(1),
    dayOffset: i,
  };
});

function groupForDisplay(events: EventRow[]) {
  const football: Record<string, EventRow[]> = {};
  const bySport: Record<string, { label: string; sportId: string; events: EventRow[] }> =
    {};

  for (const e of events) {
    if (e.sport === "futbol") {
      const key = (e.competition || "Fútbol").split(" · ")[0];
      if (!football[key]) football[key] = [];
      football[key].push(e);
    } else {
      const sportId = e.sport ?? "otros";
      if (!bySport[sportId]) {
        bySport[sportId] = {
          label: sportLabel(sportId),
          sportId,
          events: [],
        };
      }
      bySport[sportId].events.push(e);
    }
  }

  return { football, bySport };
}

function renderEventSections(events: EventRow[]) {
  const sections = groupForDisplay(events);

  return (
    <>
      {Object.entries(sections.football).map(([comp, evs]) => (
        <div key={comp} className="fh-section-block">
          <div className={`fh-comp-header ${competitionAccentClass(comp)}`}>
            <h3>{comp}</h3>
            <span className="fh-comp-count">{evs.length}</span>
          </div>
          <div className="fh-match-grid">
            {evs.map((e) => (
              <MatchCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      ))}

      {Object.values(sections.bySport).map(({ label, sportId, events: evs }) => (
        <div key={sportId} className="fh-section-block">
          <div className={`fh-comp-header ${sportAccentClass(sportId)}`}>
            <h3>{label}</h3>
            <span className="fh-comp-count">{evs.length}</span>
          </div>
          <div className="fh-match-grid">
            {evs.map((e) => (
              <MatchCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default function Home() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const scrollLockRef = useRef(false);
  const scrollLockTimerRef = useRef<number | null>(null);

  const isFeaturedMode = selectedSports.length === 0;

  const loadEvents = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setLoadError(null);

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      setLoadError(error.message);
      if (!silent) setEvents([]);
    } else {
      setEvents(
        filterEventsForDisplay(dedupeEvents(data || []) as EventRow[]).filter(
          (e) => e.sport !== "dota2"
        )
      );
    }

    if (silent) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSelectedSports(parsed);
      }
    } catch {}
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedSports));
    } catch {}
  }, [selectedSports]);

  const visibleDays = useMemo(
    () =>
      ALL_DAYS.map((day) => ({
        ...day,
        title: madridDayTitle(day.date, day.dayOffset),
        events: resolveDayEventsForFeed(
          events,
          day.date,
          selectedSports,
          isFeaturedMode
        ),
      })).filter((day) => day.events.length > 0),
    [events, selectedSports, isFeaturedMode]
  );

  useEffect(() => {
    setActiveDay((prev) => {
      if (visibleDays.length === 0) return 0;
      return Math.min(prev, visibleDays.length - 1);
    });
  }, [visibleDays.length, selectedSports.join(",")]);

  const lockScrollSpy = useCallback((ms = 900) => {
    scrollLockRef.current = true;
    if (scrollLockTimerRef.current !== null) {
      window.clearTimeout(scrollLockTimerRef.current);
    }
    scrollLockTimerRef.current = window.setTimeout(() => {
      scrollLockRef.current = false;
      scrollLockTimerRef.current = null;
    }, ms);
  }, []);

  const goToDay = useCallback(
    (index: number) => {
      const day = visibleDays[index];
      if (!day) return;

      lockScrollSpy();
      setActiveDay(index);
      document
        .getElementById(`day-${day.date}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [lockScrollSpy, visibleDays]
  );

  const resetHome = useCallback(() => {
    lockScrollSpy();
    setActiveDay(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    void loadEvents({ silent: true });
  }, [loadEvents, lockScrollSpy]);

  useEffect(() => {
    if (loading || visibleDays.length === 0) return;

    const sections = visibleDays
      .map((d) => document.getElementById(`day-${d.date}`))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const anchor =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--qvh-navbar-h"
        )
      ) +
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--qvh-day-tabs-h"
        )
      ) +
      8;

    let frame = 0;

    function syncActiveDay() {
      if (scrollLockRef.current) return;

      let next = 0;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= anchor) {
          next = i;
        }
      }
      setActiveDay((prev) => (prev === next ? prev : next));
    }

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        syncActiveDay();
      });
    }

    syncActiveDay();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [loading, visibleDays]);

  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo onHomeClick={resetHome} />
          <h1 className="qvh-hero-title">
            Qué ver <span className="qvh-hero-accent">hoy</span> en TV y streaming
          </h1>
          <ul className="qvh-legend" aria-label="Categorías">
            {LEGEND_ITEMS.map((item) => (
              <li key={item.label}>
                <span className={`qvh-dot ${item.dot}`} />
                {item.label}
              </li>
            ))}
          </ul>
          <div className="fh-nav-links">
            <AdminNavLink />
          </div>
        </div>
      </nav>

      <div className="fh-content">
        <div className="fh-container fh-main">
          <EventFilters
            selected={selectedSports}
            onChange={setSelectedSports}
            isFeaturedMode={isFeaturedMode}
          />

          <DayTabs
            days={visibleDays}
            activeIndex={activeDay}
            onChange={goToDay}
          />

          {refreshing && !loading && (
            <p className="fh-feed-refresh" aria-live="polite">
              Actualizando eventos…
            </p>
          )}

          {loading && events.length === 0 ? (
            <LoadingState />
          ) : loadError ? (
            <div className="fh-empty">
              <p>No se pudieron cargar los eventos.</p>
              <p style={{ fontSize: "0.85em" }}>{loadError}</p>
              <button
                type="button"
                className="fh-btn fh-btn-primary"
                onClick={() => void loadEvents()}
              >
                Reintentar
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="fh-empty">
              <p>No hay eventos. Abre /api/cron para importar.</p>
            </div>
          ) : visibleDays.length === 0 ? (
            <div className="fh-empty">
              <p>
                {isFeaturedMode
                  ? "No hay destacados en los próximos 7 días."
                  : "No hay eventos para los filtros seleccionados en los próximos 7 días."}
              </p>
            </div>
          ) : (
            <div className="fh-day-feed">
              {visibleDays.map((section, i) => (
                <section
                  key={section.date}
                  id={`day-${section.date}`}
                  className="fh-day-section fh-matchday"
                  aria-labelledby={`day-title-${section.date}`}
                >
                  <h2
                    id={`day-title-${section.date}`}
                    className="fh-matchday-header"
                  >
                    {section.title}{" "}
                    <span className="fh-md-count">({section.events.length})</span>
                    {isFeaturedMode && i === activeDay && (
                      <span className="fh-featured-badge">Destacados</span>
                    )}
                  </h2>

                  {renderEventSections(section.events)}
                </section>
              ))}
            </div>
          )}

          <SiteFooter />
        </div>
      </div>
    </div>
  );
}

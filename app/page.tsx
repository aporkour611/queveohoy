"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./lib/supabase";
import { dedupeEvents } from "./lib/dedupe-events";
import { filterEventsWithCrests } from "./lib/event-crests";
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

const DAYS = getMadridWeekDates(10).map((date, i) => {
  const weekday = formatMadridWeekday(date, "short");
  const month = formatMadridMonthShort(date);
  return {
    label:
      i === 0 ? "Hoy" : i === 1 ? "Mañana" : weekday.charAt(0).toUpperCase() + weekday.slice(1, 3),
    date,
    num: madridDayNumber(date),
    month: month.charAt(0).toUpperCase() + month.slice(1),
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const scrollLockRef = useRef(false);

  const isFeaturedMode = selectedSports.length === 0;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSelectedSports(parsed);
      }
    } catch {}
    loadEvents();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedSports));
    } catch {}
  }, [selectedSports]);

  async function loadEvents() {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      setLoadError(error.message);
      setEvents([]);
    } else {
      setEvents(filterEventsWithCrests(dedupeEvents(data || []) as EventRow[]));
    }
    setLoading(false);
  }

  const daySections = useMemo(
    () =>
      DAYS.map((day, index) => ({
        ...day,
        index,
        title: madridDayTitle(day.date, index),
        events: resolveDayEventsForFeed(
          events,
          day.date,
          selectedSports,
          isFeaturedMode
        ),
      })),
    [events, selectedSports, isFeaturedMode]
  );

  const goToDay = useCallback((index: number) => {
    scrollLockRef.current = true;
    setActiveDay(index);
    const el = document.getElementById(`day-${DAYS[index].date}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      scrollLockRef.current = false;
    }, 700);
  }, []);

  useEffect(() => {
    if (loading) return;

    const sections = DAYS.map((d) =>
      document.getElementById(`day-${d.date}`)
    ).filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollLockRef.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = visible[0]?.target.id;
        if (!top) return;

        const idx = DAYS.findIndex((d) => `day-${d.date}` === top);
        if (idx >= 0) setActiveDay(idx);
      },
      {
        rootMargin: "-12% 0px -58% 0px",
        threshold: [0, 0.15, 0.35],
      }
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [loading, events, selectedSports, isFeaturedMode]);

  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
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
            days={DAYS}
            activeIndex={activeDay}
            onChange={goToDay}
          />

          {loading ? (
            <LoadingState />
          ) : loadError ? (
            <div className="fh-empty">
              <p>No se pudieron cargar los eventos.</p>
              <p style={{ fontSize: "0.85em" }}>{loadError}</p>
              <button
                type="button"
                className="fh-btn fh-btn-primary"
                onClick={loadEvents}
              >
                Reintentar
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="fh-empty">
              <p>No hay eventos. Abre /api/cron para importar.</p>
            </div>
          ) : (
            <div className="fh-day-feed">
              {daySections.map((section) => (
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
                    {isFeaturedMode && section.index === activeDay && (
                      <span className="fh-featured-badge">Destacados</span>
                    )}
                  </h2>

                  {section.events.length === 0 ? (
                    <div className="fh-day-empty">
                      <p>
                        {isFeaturedMode
                          ? "Sin destacados este día."
                          : "Sin eventos para los filtros seleccionados."}
                      </p>
                    </div>
                  ) : (
                    renderEventSections(section.events)
                  )}
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

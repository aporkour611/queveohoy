"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { HOME_SSR_DAY_COUNT } from "../lib/home-feed-config";
import { countHiddenHomeEvents } from "../lib/featured";
import { partidosHoyDatePath } from "../lib/seo-date";
import Link from "next/link";
import { STORAGE_KEY, ALL_SPORT_IDS } from "../lib/filter-config";
import {
  COOKIE_CONSENT_EVENT,
  hasPreferenceConsent,
} from "../lib/cookie-consent";
import { deferClientStateUpdate } from "../lib/defer-client-state";
import { DayTabs } from "./DayTabs";
import { EventDaySections } from "./EventDaySections";
import { EventFilters } from "./EventFilters";
import { LoadingState } from "./LoadingState";
import { AdminNavLink } from "./AdminNavLink";
import { Logo } from "./Logo";
import { FeedErrorBoundary } from "./FeedErrorBoundary";
import { LazyMount } from "./LazyMount";
import { ScrollToTop } from "./ScrollToTop";
import { SiteFooter } from "./SiteFooter";
import type { EventRow } from "./types";
import {
  buildDisplayDays,
  filterEventsInWeek,
  MADRID_TZ,
} from "../lib/timezone";
import { filterEventsByQuery } from "../lib/event-search";
import {
  indexDisplayEventsByDate,
  resolveDayEventsFromIndex,
} from "../lib/upcoming-events";

const DestacadosSection = dynamic(
  () =>
    import("./DestacadosSection").then((mod) => mod.DestacadosSection),
  { loading: () => null }
);

const EventSearch = dynamic(
  () => import("./EventSearch").then((mod) => mod.EventSearch),
  { loading: () => null }
);

type Props = {
  initialEvents?: EventRow[];
  initialDestacadosEvents?: EventRow[];
  initialError?: string | null;
  children?: ReactNode;
};

function getScrollAnchorOffset(): number {
  const navH = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--qvh-navbar-h")
  );
  return (Number.isFinite(navH) ? navH : 64) + 12;
}

function scrollToDaySection(date: string) {
  const el = document.getElementById(`day-${date}`);
  if (!el) return;

  const top =
    el.getBoundingClientRect().top + window.scrollY - getScrollAnchorOffset();
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export function HomePage({
  initialEvents = [],
  initialDestacadosEvents = [],
  initialError = null,
  children,
}: Props = {}) {
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [activeDay, setActiveDay] = useState(0);
  const [weekView, setWeekView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [hasFullWeek, setHasFullWeek] = useState(false);
  const scrollLockRef = useRef(false);
  const scrollLockTimerRef = useRef<number | null>(null);

  const isFeaturedMode = selectedSports.length === 0;
  const deferredSports = useDeferredValue(selectedSports);
  const deferredFeaturedMode = deferredSports.length === 0;
  const hasInitialData = initialEvents.length > 0;

  const loadEvents = useCallback(async (options?: { silent?: boolean; fullWeek?: boolean }) => {
    const silent = options?.silent ?? false;
    const fullWeek = options?.fullWeek ?? false;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setLoadError(null);

    try {
      const url = fullWeek ? "/api/events" : "/api/events?scope=home";
      const res = await fetch(url);
      const body = (await res.json()) as {
        events?: EventRow[];
        error?: string;
      };

      if (!res.ok || body.error) {
        setLoadError(body.error ?? "No se pudieron cargar los eventos");
        if (!silent) setEvents([]);
      } else {
        setEvents(body.events ?? []);
        if (fullWeek) setHasFullWeek(true);
      }
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "No se pudieron cargar los eventos"
      );
      if (!silent) setEvents([]);
    }

    if (silent) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    deferClientStateUpdate(() => {
      if (hasPreferenceConsent()) {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setSelectedSports(
                [
                  ...new Set(
                    parsed.flatMap((id): string[] => {
                      if (typeof id !== "string") return [];
                      if (id === "tv") return ["tv-reality", "tv-concurso"];
                      return ALL_SPORT_IDS.includes(id) ? [id] : [];
                    })
                  ),
                ]
              );
            }
          }
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    if (hasInitialData) return;
    queueMicrotask(() => {
      void loadEvents();
    });
  }, [hasInitialData, loadEvents]);

  useEffect(() => {
    if (!weekView || hasFullWeek || loading) return;
    queueMicrotask(() => {
      void loadEvents({ silent: true, fullWeek: true });
    });
  }, [weekView, hasFullWeek, loading, loadEvents]);

  useEffect(() => {
    if (!hasPreferenceConsent()) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedSports));
      } catch {}
    }, 120);
    return () => window.clearTimeout(timer);
  }, [selectedSports]);

  useEffect(() => {
    function onConsentChange() {
      if (!hasPreferenceConsent()) {
        setSelectedSports([]);
      }
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, []);

  const dayWindow = hasFullWeek ? FEED_DAY_COUNT : HOME_SSR_DAY_COUNT;

  const destacadosEvents = useMemo(
    () => (hasFullWeek ? events : initialDestacadosEvents.length ? initialDestacadosEvents : events),
    [hasFullWeek, events, initialDestacadosEvents]
  );

  const displayEvents = useMemo(
    () => filterEventsInWeek(events, MADRID_TZ, dayWindow),
    [events, dayWindow]
  );

  const displayDays = useMemo(
    () => buildDisplayDays(MADRID_TZ, dayWindow),
    [dayWindow]
  );

  const eventsByDate = useMemo(
    () => indexDisplayEventsByDate(displayEvents),
    [displayEvents]
  );

  const deferredSportSet = useMemo(
    () => new Set(deferredSports),
    [deferredSports]
  );

  const daySections = useMemo(
    () =>
      displayDays.map((day) => ({
        ...day,
        events: resolveDayEventsFromIndex(
          eventsByDate,
          day.date,
          deferredSportSet,
          deferredFeaturedMode
        ),
      })),
    [displayDays, eventsByDate, deferredSportSet, deferredFeaturedMode]
  );

  const feedEvents = useMemo(
    () => daySections.flatMap((section) => section.events),
    [daySections]
  );

  const activeSection = daySections[activeDay];

  const hiddenOnActiveDay = useMemo(() => {
    if (!deferredFeaturedMode || !activeSection) return 0;
    const rawDay = displayEvents.filter((e) => e.date === activeSection.date);
    return countHiddenHomeEvents(rawDay, activeSection.events);
  }, [deferredFeaturedMode, activeSection, displayEvents]);

  const searchResults = useMemo(
    () => filterEventsByQuery(feedEvents, searchQuery),
    [feedEvents, searchQuery]
  );
  const showSearch = searchQuery.trim().length >= 2;

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

  const handleFilterChange = useCallback((ids: string[]) => {
    setSelectedSports(ids);
    setActiveDay(0);
  }, []);

  useEffect(() => {
    deferClientStateUpdate(() =>
      setActiveDay((prev) => Math.min(prev, Math.max(daySections.length - 1, 0)))
    );
  }, [daySections.length]);

  const showInitialLoading = loading && events.length === 0;

  const goToDay = useCallback(
    (index: number) => {
      const day = daySections[index];
      if (!day) return;

      const apply = () => {
        setActiveDay(index);

        if (weekView) {
          lockScrollSpy();
          requestAnimationFrame(() => scrollToDaySection(day.date));
        } else {
          const feed = document.getElementById("day-feed");
          if (feed) {
            const top =
              feed.getBoundingClientRect().top +
              window.scrollY -
              getScrollAnchorOffset();
            window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
          }
        }
      };

      if (index >= HOME_SSR_DAY_COUNT && !hasFullWeek) {
        void loadEvents({ silent: true, fullWeek: true }).then(apply);
        return;
      }

      apply();
    },
    [lockScrollSpy, daySections, weekView, hasFullWeek, loadEvents]
  );

  const resetHome = useCallback(() => {
    lockScrollSpy();
    setActiveDay(0);
    setWeekView(false);
    setHasFullWeek(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    void loadEvents({ silent: true, fullWeek: false });
  }, [loadEvents, lockScrollSpy]);

  useEffect(() => {
    if (!weekView || showInitialLoading || daySections.length === 0) return;

    const sections = daySections
      .map((d) => document.getElementById(`day-${d.date}`))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const anchor = getScrollAnchorOffset();
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
  }, [showInitialLoading, daySections, weekView]);

  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo onHomeClick={resetHome} />
          <div className="fh-nav-links">
            <AdminNavLink />
          </div>
        </div>
      </nav>

      <main className="fh-content">
        <div className="fh-container fh-main">
          <h1 className="sr-only">Qué ver hoy en TV</h1>

          <EventFilters
            selected={selectedSports}
            onChange={handleFilterChange}
            isFeaturedMode={isFeaturedMode}
          />

          {isFeaturedMode ? children : null}

          <EventSearch
            events={feedEvents}
            onQueryChange={setSearchQuery}
            onPickDay={(date) => {
              const index = daySections.findIndex((d) => d.date === date);
              if (index >= 0) goToDay(index);
            }}
          />

          {isFeaturedMode && (
            <FeedErrorBoundary>
              <DestacadosSection events={destacadosEvents} />
            </FeedErrorBoundary>
          )}

          <DayTabs
            days={daySections}
            activeIndex={activeDay}
            onChange={goToDay}
          />

          <div className="qvh-view-toggle">
            <button
              type="button"
              className={`qvh-view-toggle-btn${!weekView ? " qvh-view-toggle-btn-active" : ""}`}
              onClick={() => setWeekView(false)}
              aria-pressed={!weekView}
            >
              Hoy
            </button>
            <button
              type="button"
              className={`qvh-view-toggle-btn${weekView ? " qvh-view-toggle-btn-active" : ""}`}
              onClick={() => {
                const openWeek = () => {
                  setWeekView(true);
                  requestAnimationFrame(() => {
                    const day = daySections[activeDay];
                    if (day) scrollToDaySection(day.date);
                  });
                };
                if (!hasFullWeek) {
                  void loadEvents({ silent: true, fullWeek: true }).then(openWeek);
                } else {
                  openWeek();
                }
              }}
              aria-pressed={weekView}
            >
              Semana completa
            </button>
          </div>

          {refreshing && !showInitialLoading && (
            <p className="fh-feed-refresh" aria-live="polite">
              Actualizando eventos…
            </p>
          )}

          {showInitialLoading ? (
            <LoadingState />
          ) : loadError && events.length === 0 ? (
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
              <p>No hay eventos en los próximos 7 días.</p>
            </div>
          ) : (
            <FeedErrorBoundary>
              {showSearch ? (
                <div className="fh-day-feed" id="day-feed">
                  <section className="fh-day-section fh-matchday">
                    <h2 className="fh-matchday-header">
                      Resultados de búsqueda
                    </h2>
                    <EventDaySections
                      events={searchResults}
                      emptyMessage="Sin eventos para esta búsqueda."
                    />
                  </section>
                </div>
              ) : weekView ? (
                <div className="fh-day-feed" id="day-feed">
                  {daySections.map((section, i) => (
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
                        {section.title}
                        {isFeaturedMode && i === activeDay && (
                          <span className="fh-featured-badge">Destacados</span>
                        )}
                      </h2>

                      <LazyMount
                        eager={i === 0 || Math.abs(i - activeDay) <= 1}
                        minHeight={Math.max(180, section.events.length * 28)}
                      >
                        <EventDaySections
                          events={section.events}
                          emptyMessage={
                            isFeaturedMode
                              ? "Sin eventos este día."
                              : "Sin eventos para estos filtros."
                          }
                        />
                      </LazyMount>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="fh-day-feed" id="day-feed">
                  {activeSection ? (
                    <section
                      id={`day-${activeSection.date}`}
                      className="fh-day-section fh-matchday"
                      aria-labelledby={`day-title-${activeSection.date}`}
                    >
                      <h2
                        id={`day-title-${activeSection.date}`}
                        className="fh-matchday-header"
                      >
                        {activeSection.title}
                        {isFeaturedMode && activeDay === 0 && (
                          <span className="fh-featured-badge">Destacados</span>
                        )}
                      </h2>

                      <EventDaySections
                        events={activeSection.events}
                        emptyMessage={
                          isFeaturedMode
                            ? "Sin eventos este día."
                            : "Sin eventos para estos filtros."
                        }
                      />
                      {hiddenOnActiveDay > 0 ? (
                        <p className="fh-home-more-link">
                          <Link href={partidosHoyDatePath(activeSection.date)}>
                            Ver todos los eventos ({hiddenOnActiveDay} más) →
                          </Link>
                        </p>
                      ) : null}
                    </section>
                  ) : null}
                </div>
              )}
            </FeedErrorBoundary>
          )}

          <SiteFooter />
        </div>
      </main>

      <ScrollToTop />
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { STORAGE_KEY, ALL_SPORT_IDS } from "../lib/filter-config";
import {
  COOKIE_CONSENT_EVENT,
  hasPreferenceConsent,
} from "../lib/cookie-consent";
import { countTodayStats } from "../lib/home-stats";
import { DayTabs } from "./DayTabs";
import { EventDaySections } from "./EventDaySections";
import { EventFilters } from "./EventFilters";
import { LoadingState } from "./LoadingState";
import { AdminNavLink } from "./AdminNavLink";
import { Logo } from "./Logo";
import { RegionTimezoneBar } from "./RegionTimezoneBar";
import { HomeCalendarHero } from "./HomeCalendarHero";
import { DestacadosSection } from "./DestacadosSection";
import { ScrollToTop } from "./ScrollToTop";
import { SiteFooter } from "./SiteFooter";
import type { EventRow } from "./types";
import { TimezoneProvider, useTimezone } from "../lib/timezone-context";
import {
  buildDisplayDays,
  filterEventsInWeek,
  mapEventsToTimezone,
} from "../lib/timezone";
import { resolveDayEventsForFeed } from "../lib/upcoming-events";

type Props = {
  initialEvents?: EventRow[];
  initialError?: string | null;
  initialFetchedAt?: string | null;
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
  initialError = null,
  initialFetchedAt = null,
  children,
}: Props = {}) {
  return (
    <TimezoneProvider>
      <HomePageContent
        initialEvents={initialEvents}
        initialError={initialError}
        initialFetchedAt={initialFetchedAt}
      >
        {children}
      </HomePageContent>
    </TimezoneProvider>
  );
}

function HomePageContent({
  initialEvents = [],
  initialError = null,
  initialFetchedAt = null,
  children,
}: Props = {}) {
  const { timeZone } = useTimezone();
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [activeDay, setActiveDay] = useState(0);
  const [weekView, setWeekView] = useState(true);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const scrollLockRef = useRef(false);
  const scrollLockTimerRef = useRef<number | null>(null);

  const isFeaturedMode = selectedSports.length === 0;
  const hasInitialData = initialEvents.length > 0;

  const loadEvents = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setLoadError(null);

    try {
      const res = await fetch("/api/events");
      const body = (await res.json()) as {
        events?: EventRow[];
        error?: string;
      };

      if (!res.ok || body.error) {
        setLoadError(body.error ?? "No se pudieron cargar los eventos");
        if (!silent) setEvents([]);
      } else {
        setEvents(body.events ?? []);
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
    if (hasPreferenceConsent()) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setSelectedSports(
              parsed.filter(
                (id): id is string =>
                  typeof id === "string" && ALL_SPORT_IDS.includes(id)
              )
            );
          }
        }
      } catch {}
    }

    if (!hasInitialData) {
      void loadEvents();
    }
  }, [hasInitialData, loadEvents]);

  useEffect(() => {
    if (!hasPreferenceConsent()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedSports));
    } catch {}
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

  const displayEvents = useMemo(
    () =>
      filterEventsInWeek(
        mapEventsToTimezone(events, timeZone),
        timeZone,
        FEED_DAY_COUNT
      ),
    [events, timeZone]
  );

  const displayDays = useMemo(
    () => buildDisplayDays(timeZone, FEED_DAY_COUNT),
    [timeZone]
  );

  const daySections = useMemo(
    () =>
      displayDays.map((day) => ({
        ...day,
        events: resolveDayEventsForFeed(
          displayEvents,
          day.date,
          selectedSports,
          isFeaturedMode
        ),
      })),
    [displayDays, displayEvents, selectedSports, isFeaturedMode]
  );

  const todayStats = useMemo(
    () => countTodayStats(events, timeZone),
    [events, timeZone]
  );

  const activeSection = daySections[activeDay];

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

  useEffect(() => {
    setActiveDay(0);
  }, [timeZone, selectedSports.join(",")]);

  useEffect(() => {
    setActiveDay((prev) => Math.min(prev, Math.max(daySections.length - 1, 0)));
  }, [daySections.length]);

  const showInitialLoading = loading && events.length === 0;

  const goToDay = useCallback(
    (index: number) => {
      const day = daySections[index];
      if (!day) return;

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
    },
    [lockScrollSpy, daySections, weekView]
  );

  const resetHome = useCallback(() => {
    lockScrollSpy();
    setActiveDay(0);
    setWeekView(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    void loadEvents({ silent: true });
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
            <RegionTimezoneBar />
            <AdminNavLink />
          </div>
        </div>
      </nav>

      <main className="fh-content">
        <div className="fh-container fh-main">
          <HomeCalendarHero fetchedAt={initialFetchedAt} stats={todayStats} />

          {children}

          <EventFilters
            selected={selectedSports}
            onChange={setSelectedSports}
            isFeaturedMode={isFeaturedMode}
          />

          {isFeaturedMode && <DestacadosSection events={displayEvents} />}

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
                setWeekView(true);
                requestAnimationFrame(() => {
                  const day = daySections[activeDay];
                  if (day) scrollToDaySection(day.date);
                });
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

                  <EventDaySections
                    events={section.events}
                    emptyMessage={
                      isFeaturedMode
                        ? "Sin eventos este día."
                        : "Sin eventos para estos filtros."
                    }
                  />
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
                </section>
              ) : null}
            </div>
          )}

          <SiteFooter />
        </div>
      </main>

      <ScrollToTop />
    </div>
  );
}

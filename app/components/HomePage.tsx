"use client";

import type { ReactNode } from "react";
import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState, startTransition } from "react";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { HOME_SSR_DAY_COUNT } from "../lib/home-feed-config";
import { countHiddenHomeEvents } from "../lib/featured";
import { partidosHoyDatePath } from "../lib/seo-date";
import Link from "next/link";
import { STORAGE_KEY, ALL_SPORT_IDS } from "../lib/filter-config";
import { TV_SPORT_FILTER_IDS } from "../lib/tv-show-category";
import {
  COOKIE_CONSENT_EVENT,
  hasPreferenceConsent,
} from "../lib/cookie-consent";
import { deferClientStateUpdate } from "../lib/defer-client-state";
import { DestacadosSection } from "./DestacadosSection";
import { FeedControls } from "./FeedControls";
import { FeedRefreshLoader } from "./FeedRefreshLoader";
import { LoadingState } from "./LoadingState";
import { AdminNavLink } from "./AdminNavLink";
import { PushNavButton } from "./PushNotifications";
import { Logo } from "./Logo";
import { FeedErrorBoundary } from "./FeedErrorBoundary";
import { ScrollToTop } from "./ScrollToTop";
import { SiteFooter } from "./SiteFooter";
import type { EventRow } from "./types";
import {
  buildDisplayDays,
  filterEventsInWeek,
  MADRID_TZ,
} from "../lib/timezone";
import {
  indexDisplayEventsByDate,
  resolveDayEventsFromIndex,
  resolveHomeDayEvents,
} from "../lib/upcoming-events";
import { mergeFeedEvents } from "../lib/merge-feed-events";
import { EventDaySections } from "./EventDaySections";

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

function scrollToDaySection(date: string, weekMode = false) {
  const el = document.getElementById(
    weekMode ? `day-week-${date}` : `day-${date}`
  );
  if (!el) return;

  const top =
    el.getBoundingClientRect().top + window.scrollY - getScrollAnchorOffset();
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

function captureScrollY(): number {
  return window.scrollY;
}

function restoreScrollY(y: number) {
  window.scrollTo({ left: 0, top: y, behavior: "instant" });
}

export function HomePage({
  initialEvents = [],
  initialDestacadosEvents = [],
  initialError = null,
  children,
}: Props = {}) {
  const [events, setEvents] = useState(() =>
    mergeFeedEvents(initialEvents, initialDestacadosEvents)
  );
  const [loading, setLoading] = useState(initialEvents.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [activeDay, setActiveDay] = useState(0);
  const [weekView, setWeekView] = useState(false);
  const [weekViewMounted, setWeekViewMounted] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [hasFullWeek, setHasFullWeek] = useState(false);
  const [fullWeekReady, setFullWeekReady] = useState(
    () => initialDestacadosEvents.length > 0
  );
  const scrollLockRef = useRef(false);
  const scrollLockTimerRef = useRef<number | null>(null);
  const pinnedScrollYRef = useRef<number | null>(null);
  const scrollRestoreFrameRef = useRef<number | null>(null);
  const fullWeekLoadRef = useRef<Promise<void> | null>(null);

  const isFeaturedMode = selectedSports.length === 0;
  const deferredSports = useDeferredValue(selectedSports);
  const deferredFeaturedMode = deferredSports.length === 0;
  const hasInitialData = initialEvents.length > 0;

  const loadEvents = useCallback(async (options?: {
    silent?: boolean;
    fullWeek?: boolean;
    /** Si false, carga datos de 7 días sin ampliar pestañas del calendario. */
    expandTabs?: boolean;
    /** Overlay de carga sobre el feed (solo si hace falta feedback explícito). */
    showLoader?: boolean;
  }) => {
    const silent = options?.silent ?? false;
    const fullWeek = options?.fullWeek ?? false;
    const expandTabs = options?.expandTabs ?? true;
    const showLoader = options?.showLoader ?? false;
    if (showLoader) {
      setRefreshing(true);
    } else if (!silent) {
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
        const incoming = body.events ?? [];
        if (fullWeek) {
          setEvents((prev) => {
            if (incoming.length === 0 && prev.length > 0) return prev;
            return mergeFeedEvents(prev, incoming);
          });
          setFullWeekReady(true);
          if (expandTabs) setHasFullWeek(true);
        } else {
          setEvents((prev) => {
            if (incoming.length === 0 && prev.length > 0) return prev;
            return mergeFeedEvents(prev, incoming);
          });
        }
      }
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "No se pudieron cargar los eventos"
      );
      if (!silent) setEvents([]);
    }

    if (showLoader) {
      setRefreshing(false);
    } else if (!silent) {
      setLoading(false);
    }
  }, []);

  const ensureFullWeek = useCallback(() => {
    if (hasFullWeek) return Promise.resolve();
    if (fullWeekReady) {
      setHasFullWeek(true);
      return Promise.resolve();
    }
    if (fullWeekLoadRef.current) return fullWeekLoadRef.current;

    fullWeekLoadRef.current = loadEvents({
      silent: true,
      fullWeek: true,
      expandTabs: true,
    }).finally(() => {
      fullWeekLoadRef.current = null;
    });
    return fullWeekLoadRef.current;
  }, [fullWeekReady, hasFullWeek, loadEvents]);

  const prefetchFullWeek = useCallback(() => {
    setWeekViewMounted(true);
    if (hasFullWeek || fullWeekReady || fullWeekLoadRef.current) return;
    fullWeekLoadRef.current = loadEvents({
      silent: true,
      fullWeek: true,
      expandTabs: false,
    }).finally(() => {
      fullWeekLoadRef.current = null;
    });
  }, [fullWeekReady, hasFullWeek, loadEvents]);

  useEffect(() => {
    if (!fullWeekReady || weekViewMounted) return;

    const mountWeekPane = () => setWeekViewMounted(true);

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(mountWeekPane, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }

    const timer = window.setTimeout(mountWeekPane, 1200);
    return () => window.clearTimeout(timer);
  }, [fullWeekReady, weekViewMounted]);

  useEffect(() => {
    if (!hasFullWeek) return;
    fullWeekLoadRef.current = null;
  }, [hasFullWeek]);

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
                      if (id === "tv") return [...TV_SPORT_FILTER_IDS];
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

  const dayWindow =
    weekView || hasFullWeek || fullWeekReady
      ? FEED_DAY_COUNT
      : HOME_SSR_DAY_COUNT;

  const destacadosEvents = useMemo(() => {
    const merged = new Map<number, EventRow>();
    for (const event of initialDestacadosEvents) {
      merged.set(event.id, event);
    }
    for (const event of events) {
      merged.set(event.id, event);
    }
    return [...merged.values()];
  }, [events, initialDestacadosEvents]);

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

  const activeSection = daySections[activeDay];
  const todayKey = displayDays[0]?.date ?? "";

  const activeHomeDay = useMemo(() => {
    if (!activeSection || weekView) {
      return {
        todayEvents: activeSection?.events ?? [],
        upcomingEvents: [],
        upcomingMessage: null,
      };
    }

    return resolveHomeDayEvents(
      eventsByDate,
      activeSection.date,
      todayKey,
      deferredSportSet,
      deferredFeaturedMode
    );
  }, [
    activeSection,
    weekView,
    eventsByDate,
    todayKey,
    deferredSportSet,
    deferredFeaturedMode,
  ]);

  const hiddenOnActiveDay = useMemo(() => {
    if (!deferredFeaturedMode || !activeSection) return 0;
    const rawDay = displayEvents.filter((e) => e.date === activeSection.date);
    return countHiddenHomeEvents(rawDay, activeSection.events);
  }, [deferredFeaturedMode, activeSection, displayEvents]);

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

  const pinScrollForViewToggle = useCallback((ms = 350) => {
    pinnedScrollYRef.current = captureScrollY();
    scrollLockRef.current = true;

    if (scrollLockTimerRef.current !== null) {
      window.clearTimeout(scrollLockTimerRef.current);
    }
    scrollLockTimerRef.current = window.setTimeout(() => {
      scrollLockRef.current = false;
      scrollLockTimerRef.current = null;
      pinnedScrollYRef.current = null;
    }, ms);
  }, []);

  const flushPinnedScroll = useCallback(() => {
    const y = pinnedScrollYRef.current;
    if (y === null) return;
    restoreScrollY(y);
  }, []);

  const schedulePinnedScrollRestore = useCallback(() => {
    flushPinnedScroll();
    if (scrollRestoreFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollRestoreFrameRef.current);
    }
    scrollRestoreFrameRef.current = window.requestAnimationFrame(() => {
      flushPinnedScroll();
      scrollRestoreFrameRef.current = window.requestAnimationFrame(flushPinnedScroll);
    });
  }, [flushPinnedScroll]);

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
          requestAnimationFrame(() => scrollToDaySection(day.date, true));
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
        void ensureFullWeek().then(apply);
        return;
      }

      apply();
    },
    [lockScrollSpy, daySections, weekView, hasFullWeek, ensureFullWeek]
  );

  const resetHome = useCallback(() => {
    lockScrollSpy();
    setActiveDay(0);
    setWeekView(false);
    setHasFullWeek(false);
    setFullWeekReady(false);
    fullWeekLoadRef.current = null;
    window.scrollTo({ top: 0, behavior: "smooth" });
    void loadEvents({ silent: true, fullWeek: false });
  }, [loadEvents, lockScrollSpy]);

  useEffect(() => {
    if (!weekView || showInitialLoading || daySections.length === 0) return;

    const sections = daySections
      .map((d) => document.getElementById(`day-week-${d.date}`))
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

    if (!scrollLockRef.current) {
      syncActiveDay();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [showInitialLoading, daySections, weekView]);

  const openWeekView = useCallback(() => {
    setWeekViewMounted(true);
    pinScrollForViewToggle();
    startTransition(() => {
      setWeekView(true);
      if (fullWeekReady) setHasFullWeek(true);
    });
    if (!fullWeekReady) {
      void ensureFullWeek();
    }
  }, [pinScrollForViewToggle, fullWeekReady, ensureFullWeek]);

  const closeWeekView = useCallback(() => {
    pinScrollForViewToggle();
    startTransition(() => setWeekView(false));
  }, [pinScrollForViewToggle]);

  useLayoutEffect(() => {
    if (pinnedScrollYRef.current === null) return;
    schedulePinnedScrollRestore();
  }, [weekView, events.length, refreshing, schedulePinnedScrollRestore]);

  useEffect(() => {
    if (pinnedScrollYRef.current === null) return;

    schedulePinnedScrollRestore();
    const timers = [0, 32, 96].map((delay) =>
      window.setTimeout(schedulePinnedScrollRestore, delay)
    );

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [weekView, events.length, refreshing, schedulePinnedScrollRestore]);

  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo onHomeClick={resetHome} />
          <div className="fh-nav-links">
            <PushNavButton />
            <AdminNavLink />
          </div>
        </div>
      </nav>

      <main id="main-content" className="fh-content">
        <div className="fh-container fh-main">
          <h1 className="sr-only">Qué ver hoy en TV</h1>

          {isFeaturedMode ? children : null}

          {isFeaturedMode && (
            <FeedErrorBoundary>
              <DestacadosSection events={destacadosEvents} />
            </FeedErrorBoundary>
          )}

          <FeedControls
            days={daySections}
            activeDayIndex={activeDay}
            onDayChange={goToDay}
            weekView={weekView}
            onSelectTodayView={closeWeekView}
            onSelectWeekView={openWeekView}
            onPrefetchWeekView={prefetchFullWeek}
            selectedSports={selectedSports}
            onFilterChange={handleFilterChange}
            isFeaturedMode={isFeaturedMode}
          />

          <div className="fh-feed-area">
            {refreshing && !showInitialLoading ? <FeedRefreshLoader /> : null}

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
                <div className="fh-day-feed" id="day-feed">
                  {weekViewMounted ? (
                    <div
                      className={
                        weekView
                          ? "fh-feed-pane fh-feed-pane-week"
                          : "fh-feed-pane fh-feed-pane-hidden"
                      }
                      aria-hidden={!weekView}
                    >
                      {daySections.map((section, i) => (
                        <section
                          key={section.date}
                          id={`day-week-${section.date}`}
                          className="fh-day-section fh-matchday"
                          aria-labelledby={`day-week-title-${section.date}`}
                        >
                          <h2
                            id={`day-week-title-${section.date}`}
                            className="fh-matchday-header"
                          >
                            {section.title}
                            {isFeaturedMode && weekView && i === activeDay ? (
                              <span className="fh-featured-badge">Destacados</span>
                            ) : null}
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
                  ) : null}

                  <div
                    className={
                      weekView
                        ? "fh-feed-pane fh-feed-pane-hidden"
                        : "fh-feed-pane fh-feed-pane-today"
                    }
                    aria-hidden={weekView}
                  >
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
                          {isFeaturedMode && activeDay === 0 ? (
                            <span className="fh-featured-badge">Destacados</span>
                          ) : null}
                        </h2>

                        <EventDaySections
                          events={activeHomeDay.todayEvents}
                          emptyMessage={
                            isFeaturedMode
                              ? "Sin eventos este día."
                              : "Sin eventos para estos filtros."
                          }
                        />
                        {activeHomeDay.upcomingMessage ? (
                          <p className="fh-upcoming-notice">{activeHomeDay.upcomingMessage}</p>
                        ) : null}
                        {activeHomeDay.upcomingEvents.length > 0 ? (
                          <EventDaySections events={activeHomeDay.upcomingEvents} />
                        ) : null}
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
                </div>
              </FeedErrorBoundary>
          )}
          </div>

          <SiteFooter />
        </div>
      </main>

      <ScrollToTop />
    </div>
  );
}

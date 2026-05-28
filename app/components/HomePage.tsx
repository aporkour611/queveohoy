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
import { FeedControls } from "./FeedControls";
import { FeedRefreshLoader } from "./FeedRefreshLoader";
import { LoadingState } from "./LoadingState";
import { FeedErrorBoundary } from "./FeedErrorBoundary";
import { EventDaySections } from "./EventDaySections";
import { useHomeReset } from "./HomeResetContext";
import dynamic from "next/dynamic";

const EventDaySectionsLazy = dynamic(
  () => import("./EventDaySections").then((mod) => mod.EventDaySections),
  { loading: () => <div className="qvh-feed-day-placeholder" aria-hidden /> }
);

const LazyMount = dynamic(
  () => import("./LazyMount").then((mod) => mod.LazyMount),
  { loading: () => null }
);

const WeekDaySection = dynamic(
  () => import("./WeekDaySection").then((mod) => mod.WeekDaySection),
  { loading: () => null }
);

const ScrollToTop = dynamic(
  () => import("./ScrollToTop").then((mod) => mod.ScrollToTop),
  { ssr: false }
);
import type { EventRow } from "./types";
import {
  buildDisplayDays,
  filterEventsInWeek,
  MADRID_TZ,
} from "../lib/timezone";
import {
  indexDisplayEventsByDate,
  resolveDayEventsFromIndex,
  resolveFeaturedHomeDayEvents,
  resolveHomeDayEvents,
} from "../lib/upcoming-events";
import { mergeFeedEvents } from "../lib/merge-feed-events";
type Props = {
  initialEvents?: EventRow[];
  initialDestacadosEvents?: EventRow[];
  initialError?: string | null;
  /** Fecha del encabezado ya renderizado en servidor (día 0). */
  serverDayHeaderDate?: string | null;
  /** Cabecera estática del día (server component). */
  dayHeader?: ReactNode;
  /** Calendario estático antes de hidratar FeedControls. */
  feedControlsShell?: ReactNode;
  children?: ReactNode;
};

let cachedScrollAnchorOffset: number | null = null;

function readScrollAnchorOffset(): number {
  const navH = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--qvh-navbar-h")
  );
  const nav = Number.isFinite(navH) ? navH : 64;
  return nav + 8;
}

function getScrollAnchorOffset(): number {
  if (cachedScrollAnchorOffset === null) {
    cachedScrollAnchorOffset = readScrollAnchorOffset();
  }
  return cachedScrollAnchorOffset;
}

function invalidateScrollAnchorOffset(): void {
  cachedScrollAnchorOffset = null;
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

export function HomeFeed({
  initialEvents = [],
  initialDestacadosEvents = [],
  initialError = null,
  serverDayHeaderDate = null,
  dayHeader,
  feedControlsShell,
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
  const { registerReset } = useHomeReset();

  const isFeaturedMode = selectedSports.length === 0;
  const deferredSports = useDeferredValue(selectedSports);
  // Al volver a "Todo", no diferir: la vista ya estuvo calculada y montada.
  // Al salir de "Todo", aplicar el filtro al instante (deferredSports puede ir un frame detrás).
  const feedSports = isFeaturedMode
    ? selectedSports
    : deferredSports.length === 0 && selectedSports.length > 0
      ? selectedSports
      : deferredSports;
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

  const feedEvents = useMemo(
    () => mergeFeedEvents(initialDestacadosEvents, events),
    [events, initialDestacadosEvents]
  );

  const displayEvents = useMemo(
    () => filterEventsInWeek(feedEvents, MADRID_TZ, dayWindow),
    [feedEvents, dayWindow]
  );

  const displayDays = useMemo(
    () => buildDisplayDays(MADRID_TZ, dayWindow),
    [dayWindow]
  );

  const eventsByDate = useMemo(
    () => indexDisplayEventsByDate(displayEvents),
    [displayEvents]
  );

  const feedSportSet = useMemo(() => new Set(feedSports), [feedSports]);

  const activeDayMeta = displayDays[activeDay] ?? null;
  const todayKey = displayDays[0]?.date ?? "";

  const activeTodayEvents = useMemo(() => {
    if (!activeDayMeta || weekView) return [];
    return resolveDayEventsFromIndex(
      eventsByDate,
      activeDayMeta.date,
      feedSportSet,
      isFeaturedMode
    );
  }, [activeDayMeta, weekView, eventsByDate, feedSportSet, isFeaturedMode]);

  const activeHomeDay = useMemo(() => {
    if (!activeDayMeta || weekView) {
      return {
        todayEvents: [] as EventRow[],
        upcomingEvents: [] as EventRow[],
        upcomingMessage: null as string | null,
      };
    }

    if (isFeaturedMode) {
      return resolveFeaturedHomeDayEvents(
        eventsByDate,
        activeDayMeta.date,
        todayKey
      );
    }

    return resolveHomeDayEvents(
      eventsByDate,
      activeDayMeta.date,
      todayKey,
      feedSportSet,
      isFeaturedMode
    );
  }, [
    activeDayMeta,
    weekView,
    eventsByDate,
    todayKey,
    feedSportSet,
    isFeaturedMode,
  ]);

  const hiddenOnActiveDay = useMemo(() => {
    if (!isFeaturedMode || !activeDayMeta) return 0;
    const rawDay = displayEvents.filter((e) => e.date === activeDayMeta.date);
    return countHiddenHomeEvents(rawDay, activeTodayEvents);
  }, [isFeaturedMode, activeDayMeta, displayEvents, activeTodayEvents]);

  const useSsrDayHeader =
    Boolean(serverDayHeaderDate) &&
    !weekView &&
    activeDay === 0 &&
    isFeaturedMode &&
    activeDayMeta?.date === serverDayHeaderDate;

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
    startTransition(() => {
      setSelectedSports(ids);
      setActiveDay(0);
    });
  }, []);

  useEffect(() => {
    deferClientStateUpdate(() =>
      setActiveDay((prev) => Math.min(prev, Math.max(displayDays.length - 1, 0)))
    );
  }, [displayDays.length]);

  const showInitialLoading = loading && events.length === 0;
  const DaySections = hasInitialData ? EventDaySections : EventDaySectionsLazy;

  useEffect(() => {
    const el = document.getElementById("home-day-header-ssr");
    if (!el) return;
    el.hidden = !useSsrDayHeader;
  }, [useSsrDayHeader]);

  useLayoutEffect(() => {
    document.getElementById("feed-controls-ssr")?.setAttribute("hidden", "");
  }, []);

  const goToDay = useCallback(
    (index: number) => {
      const day = displayDays[index];
      if (!day) return;

      const apply = () => {
        startTransition(() => setActiveDay(index));

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
    [lockScrollSpy, displayDays, weekView, hasFullWeek, ensureFullWeek]
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
    registerReset(resetHome);
  }, [registerReset, resetHome]);

  useEffect(() => {
    if (!weekView || showInitialLoading || displayDays.length === 0) return;

    const sections = displayDays
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
      window.requestAnimationFrame(syncActiveDay);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    const handleResize = () => {
      invalidateScrollAnchorOffset();
      onScroll();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [showInitialLoading, displayDays, weekView, invalidateScrollAnchorOffset]);

  const openWeekView = useCallback(() => {
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
    <>
          <div
            className={isFeaturedMode ? undefined : "fh-feed-pane-hidden"}
            aria-hidden={!isFeaturedMode}
          >
            {children}
          </div>

          {feedControlsShell}

          <FeedControls
            days={displayDays}
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
            {dayHeader}
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
                  {weekView ? (
                    <div className="fh-feed-pane fh-feed-pane-week">
                      {displayDays.map((day, i) => (
                        <WeekDaySection
                          key={day.date}
                          day={day}
                          dayIndex={i}
                          activeDay={activeDay}
                          isFeaturedMode={isFeaturedMode}
                          eventsByDate={eventsByDate}
                          sportFilter={feedSportSet}
                          featuredMode={isFeaturedMode}
                        />
                      ))}
                    </div>
                  ) : activeDayMeta ? (
                    <div className="fh-feed-pane fh-feed-pane-today">
                      <section
                        id={`day-${activeDayMeta.date}`}
                        className="fh-day-section fh-matchday"
                        aria-labelledby={`day-title-${activeDayMeta.date}`}
                      >
                        {useSsrDayHeader ? null : (
                          <h2
                            id={`day-title-${activeDayMeta.date}`}
                            className="fh-matchday-header"
                          >
                            {activeDayMeta.title}
                            {isFeaturedMode && activeDay === 0 ? (
                              <span className="fh-featured-badge">Destacados</span>
                            ) : null}
                          </h2>
                        )}

                        <DaySections
                          events={activeHomeDay.todayEvents}
                          priority="high"
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
                          <LazyMount minHeight={240} rootMargin="400px 0px">
                            <DaySections events={activeHomeDay.upcomingEvents} />
                          </LazyMount>
                        ) : null}
                        {hiddenOnActiveDay > 0 ? (
                          <p className="fh-home-more-link">
                            <Link href={partidosHoyDatePath(activeDayMeta.date)}>
                              Ver todos los eventos ({hiddenOnActiveDay} más) →
                            </Link>
                          </p>
                        ) : null}
                      </section>
                    </div>
                  ) : null}
                </div>
              </FeedErrorBoundary>
          )}
          </div>

      <ScrollToTop />
    </>
  );
}

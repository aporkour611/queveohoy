"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  FEED_DAY_COUNT,
  normalizeFeedEvents,
} from "../lib/events-feed";
import { STORAGE_KEY, sportLabel, ALL_SPORT_IDS } from "../lib/filter-config";
import { DayTabs } from "./DayTabs";
import { EventFilters } from "./EventFilters";
import { LoadingState } from "./LoadingState";
import { AdminNavLink } from "./AdminNavLink";
import { Logo } from "./Logo";
import { RegionTimezoneBar } from "./RegionTimezoneBar";
import { DestacadosSection } from "./DestacadosSection";
import { MatchCard } from "./MatchCard";
import { ScrollToTop } from "./ScrollToTop";
import { SiteFooter } from "./SiteFooter";
import type { EventRow } from "./types";
import { competitionAccentClass, sportAccentClass } from "../lib/sport-accent";
import { TimezoneProvider, useTimezone } from "../lib/timezone-context";
import {
  buildDisplayDays,
  filterEventsInWeek,
  getEventsQueryDateRange,
  mapEventsToTimezone,
} from "../lib/timezone";
import { resolveDayEventsForFeed } from "../lib/upcoming-events";
import {
  defaultDescription,
  siteBrand,
  siteName,
  siteUrl,
} from "../lib/seo";

function HomeJsonLdInline() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteBrand,
        url: siteUrl,
        logo: `${siteUrl}/logo-queveohoy.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        alternateName: ["que veo hoy", "qué ver hoy", "queveohoy"],
        url: siteUrl,
        description: defaultDescription,
        inLanguage: "es-ES",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: "Qué ver hoy en TV y streaming",
        description: defaultDescription,
        isPartOf: { "@id": `${siteUrl}/#website` },
        inLanguage: "es-ES",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

type Props = {
  initialEvents?: EventRow[];
  initialError?: string | null;
  children?: ReactNode;
};

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

export function HomePage({
  initialEvents = [],
  initialError = null,
  children,
}: Props = {}) {
  return (
    <>
      <HomeJsonLdInline />
      <TimezoneProvider>
        <HomePageContent
          initialEvents={initialEvents}
          initialError={initialError}
        >
          {children}
        </HomePageContent>
      </TimezoneProvider>
    </>
  );
}

function HomePageContent({
  initialEvents = [],
  initialError = null,
  children,
}: Props = {}) {
  const { timeZone } = useTimezone();
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [activeDay, setActiveDay] = useState(0);
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

    const { from, to } = getEventsQueryDateRange(FEED_DAY_COUNT);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      setLoadError(error.message);
      if (!silent) setEvents([]);
    } else {
      setEvents(normalizeFeedEvents(data as EventRow[]));
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

    if (!hasInitialData) {
      void loadEvents();
    }
  }, [hasInitialData, loadEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedSports));
    } catch {}
  }, [selectedSports]);

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

  const visibleDays = useMemo(
    () =>
      displayDays
        .map((day) => ({
          ...day,
          events: resolveDayEventsForFeed(
            displayEvents,
            day.date,
            selectedSports,
            isFeaturedMode
          ),
        }))
        .filter((day) => day.events.length > 0),
    [displayDays, displayEvents, selectedSports, isFeaturedMode]
  );

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
    setActiveDay((prev) => {
      if (visibleDays.length === 0) return 0;
      return Math.min(prev, visibleDays.length - 1);
    });
  }, [visibleDays.length]);

  const showInitialLoading = loading && events.length === 0;

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
    if (showInitialLoading || visibleDays.length === 0) return;

    const sections = visibleDays
      .map((d) => document.getElementById(`day-${d.date}`))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const anchor =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--qvh-navbar-h"
        )
      ) + 8;

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
  }, [showInitialLoading, visibleDays]);

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
          <EventFilters
            selected={selectedSports}
            onChange={setSelectedSports}
            isFeaturedMode={isFeaturedMode}
          />

          {isFeaturedMode && <DestacadosSection events={displayEvents} />}

          <DayTabs
            days={visibleDays}
            activeIndex={activeDay}
            onChange={goToDay}
          />

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
          ) : visibleDays.length === 0 ? (
            <div className="fh-empty">
              <p>
                {isFeaturedMode
                  ? "No hay eventos en los próximos 7 días."
                  : "No hay eventos para los filtros seleccionados en los próximos 7 días."}
              </p>
            </div>
          ) : (
            <div className="fh-day-feed" id="day-feed">
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
                    {section.title}
                    {isFeaturedMode && i === activeDay && (
                      <span className="fh-featured-badge">Destacados</span>
                    )}
                  </h2>

                  {renderEventSections(section.events)}
                </section>
              ))}
            </div>
          )}

          {children}

          <SiteFooter />
        </div>
      </main>

      <ScrollToTop />
    </div>
  );
}

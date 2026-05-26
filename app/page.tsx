"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import { dedupeEvents } from "./lib/dedupe-events";
import { pickFeaturedEvents } from "./lib/featured";
import { STORAGE_KEY, sportLabel } from "./lib/filter-config";
import { EventFilters } from "./components/EventFilters";
import { Logo } from "./components/Logo";
import { MatchCard } from "./components/MatchCard";
import type { EventRow } from "./components/types";
import {
  formatMadridMonthShort,
  formatMadridWeekday,
  getMadridWeekDates,
  madridDayNumber,
  madridDayTitle,
} from "./lib/madrid-time";

const DAYS = getMadridWeekDates(10).map((date, i) => {
  const weekday = formatMadridWeekday(date, "short");
  const month = formatMadridMonthShort(date);
  return {
    label: i === 0 ? "HOY" : weekday.charAt(0).toUpperCase() + weekday.slice(1, 3),
    date,
    num: madridDayNumber(date),
    month: month.charAt(0).toUpperCase() + month.slice(1),
    showSep: i === 7,
  };
});

function groupForDisplay(events: EventRow[]) {
  const football: Record<string, EventRow[]> = {};
  const bySport: Record<string, EventRow[]> = {};

  for (const e of events) {
    if (e.sport === "futbol") {
      const key = (e.competition || "Fútbol").split(" · ")[0];
      if (!football[key]) football[key] = [];
      football[key].push(e);
    } else {
      const key = sportLabel(e.sport ?? "otros");
      if (!bySport[key]) bySport[key] = [];
      bySport[key].push(e);
    }
  }

  return { football, bySport };
}

export default function Home() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

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
      setEvents(dedupeEvents(data || []) as EventRow[]);
    }
    setLoading(false);
  }

  const dayEvents = useMemo(
    () => events.filter((e) => e.date === DAYS[activeDay].date),
    [events, activeDay]
  );

  const visibleEvents = useMemo(() => {
    if (isFeaturedMode) {
      return pickFeaturedEvents(dayEvents);
    }
    return dayEvents.filter((e) => selectedSports.includes(e.sport ?? ""));
  }, [dayEvents, isFeaturedMode, selectedSports]);

  const sections = useMemo(
    () => groupForDisplay(visibleEvents),
    [visibleEvents]
  );

  const dayTitle = madridDayTitle(DAYS[activeDay].date, activeDay);

  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
          <div className="fh-nav-links">
            <a href="/">Partidos</a>
            <a href="/admin">Admin</a>
          </div>
        </div>
      </nav>

      <div className="fh-content">
        <div className="fh-title-bar">
          <div className="fh-container">
            <h1>Qué ver hoy en TV y streaming</h1>
          </div>
        </div>

        <div className="fh-container">
          <EventFilters
            selected={selectedSports}
            onChange={setSelectedSports}
            isFeaturedMode={isFeaturedMode}
          />

          <div id="fh-days-carousel">
            {DAYS.map((day, i) => (
              <span key={day.date} style={{ display: "inline" }}>
                {day.showSep && <span className="fh-cal-sep" />}
                <button
                  type="button"
                  className={`fh-day ${activeDay === i ? "selected" : ""}`}
                  onClick={() => setActiveDay(i)}
                >
                  <em>{day.month}</em>
                  <strong>{day.label}</strong>
                  <span className="fh-day-num">{day.num}</span>
                </button>
              </span>
            ))}
          </div>

          <div className="fh-matchday">
            <h2 className="fh-matchday-header">
              {dayTitle}{" "}
              <span className="fh-md-count">({visibleEvents.length})</span>
              {isFeaturedMode && (
                <span className="fh-featured-badge">Destacados</span>
              )}
            </h2>

            {loading ? (
              <div className="fh-empty">Cargando partidos...</div>
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
            ) : visibleEvents.length === 0 ? (
              <div className="fh-empty">
                <p>
                  {events.length === 0
                    ? "No hay eventos. Abre /api/cron para importar."
                    : isFeaturedMode
                      ? "Sin destacados este día. Usa los filtros para explorar más deportes."
                      : "Ningún evento para los filtros seleccionados."}
                </p>
                {!isFeaturedMode && (
                  <button
                    type="button"
                    className="fh-btn"
                    onClick={() => setSelectedSports([])}
                  >
                    Ver destacados
                  </button>
                )}
              </div>
            ) : (
              <>
                {Object.entries(sections.football).map(([comp, evs]) => (
                  <div key={comp}>
                    <div className="fh-comp-header">
                      <h3>{comp}</h3>
                    </div>
                    <div className="fh-match-grid">
                      {evs.map((e) => (
                        <MatchCard key={e.id} event={e} />
                      ))}
                    </div>
                  </div>
                ))}

                {Object.entries(sections.bySport).map(([label, evs]) => (
                  <div key={label}>
                    <div className="fh-comp-header">
                      <h3>{label}</h3>
                    </div>
                    <div className="fh-match-grid">
                      {evs.map((e) => (
                        <MatchCard key={e.id} event={e} />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <p className="fh-footer">
            Horario península y Baleares (Europe/Madrid) · queveohoy.es
          </p>
        </div>
      </div>
    </div>
  );
}

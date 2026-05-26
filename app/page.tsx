"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import { dedupeEvents } from "./lib/dedupe-events";
import { MatchCard } from "./components/MatchCard";

const SPORT_TABS = [
  { id: "all", label: "Todo" },
  { id: "deportes", label: "Fútbol" },
  { id: "esports", label: "E-Sports" },
];

const SUB_FILTERS: Record<string, { id: string; label: string }[]> = {
  deportes: [
    { id: "futbol", label: "Fútbol" },
    { id: "formula1", label: "F1" },
    { id: "tenis", label: "Tenis" },
    { id: "basket", label: "Basket" },
  ],
  esports: [
    { id: "csgo", label: "CS2" },
    { id: "valorant", label: "Valorant" },
    { id: "lol", label: "LoL" },
    { id: "dota2", label: "Dota 2" },
  ],
};

function getChildIds(catId: string): string[] {
  return SUB_FILTERS[catId]?.map((s) => s.id) ?? [];
}

function getDateOffset(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

const DAYS = Array.from({ length: 10 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  const month = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  const weekday = d
    .toLocaleDateString("es-ES", { weekday: "short" })
    .replace(".", "");
  return {
    label: i === 0 ? "HOY" : weekday.charAt(0).toUpperCase() + weekday.slice(1, 3),
    date: d.toISOString().split("T")[0],
    num: d.getDate(),
    month: month.charAt(0).toUpperCase() + month.slice(1),
    showSep: i === 7,
  };
});

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [activeCat, setActiveCat] = useState("deportes");
  const [activeSub, setActiveSub] = useState<string | null>("futbol");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("qvh_filters");
      if (saved) {
        const { cat, sub } = JSON.parse(saved);
        if (cat) setActiveCat(cat);
        if (sub !== undefined) setActiveSub(sub);
      }
    } catch {}
    loadEvents();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "qvh_filters",
        JSON.stringify({ cat: activeCat, sub: activeSub })
      );
    } catch {}
  }, [activeCat, activeSub]);

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
      setEvents(dedupeEvents(data || []));
    }
    setLoading(false);
  }

  function resetFilters() {
    setActiveCat("all");
    setActiveSub(null);
    setActiveDay(0);
    try {
      localStorage.removeItem("qvh_filters");
    } catch {}
  }

  const dayEvents = events.filter((e) => e.date === DAYS[activeDay].date);

  const visibleEvents = dayEvents.filter((e) => {
    if (activeCat === "all") return true;
    if (activeSub) return e.sport === activeSub;
    const children = getChildIds(activeCat);
    if (activeCat === "deportes" && !activeSub) {
      return e.sport === "futbol";
    }
    return children.includes(e.sport) || e.category === activeCat;
  });

  const sections = useMemo(() => {
    const football: Record<string, any[]> = {};
    const other: Record<string, any[]> = {};

    for (const e of visibleEvents) {
      if (e.sport === "futbol") {
        const key = (e.competition || "Otros").split(" · ")[0];
        if (!football[key]) football[key] = [];
        football[key].push(e);
      } else {
        const key =
          e.sport === "csgo"
            ? "CS2"
            : e.sport === "valorant"
              ? "Valorant"
              : e.sport === "lol"
                ? "League of Legends"
                : e.sport === "dota2"
                  ? "Dota 2"
                  : e.sport || "Otros";
        if (!other[key]) other[key] = [];
        other[key].push(e);
      }
    }

    return { football, other };
  }, [visibleEvents]);

  const dayDate = new Date(DAYS[activeDay].date + "T12:00:00");
  const dayTitle =
    activeDay === 0
      ? `Hoy ${dayDate.toLocaleDateString("es-ES", { weekday: "long" })}, ${dayDate.getDate()} de ${dayDate.toLocaleDateString("es-ES", { month: "long" })}`
      : activeDay === 1
        ? `Mañana ${dayDate.toLocaleDateString("es-ES", { weekday: "long" })}, ${dayDate.getDate()} de ${dayDate.toLocaleDateString("es-ES", { month: "long" })}`
        : `${dayDate.toLocaleDateString("es-ES", { weekday: "long" })}, ${dayDate.getDate()} de ${dayDate.toLocaleDateString("es-ES", { month: "long" })}`;

  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <a href="/" className="fh-logo">
            Qué<span>ver</span>hoy
          </a>
          <div className="fh-nav-links">
            <a href="/">Partidos</a>
            <a href="/admin">Admin</a>
          </div>
        </div>
      </nav>

      <div className="fh-content">
        <div className="fh-container">
          <div className="fh-sports-selector">
            {SPORT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`fh-sport-col ${activeCat === tab.id ? "selected" : ""}`}
                onClick={() => {
                  setActiveCat(tab.id);
                  setActiveSub(null);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="fh-title-bar">
          <div className="fh-container">
            <h1>Partidos de fútbol hoy en TV</h1>
          </div>
        </div>

        <div className="fh-container">
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

          {SUB_FILTERS[activeCat] && (
            <div className="fh-sub-filters">
              <button
                type="button"
                className={activeSub === null ? "active" : ""}
                onClick={() => setActiveSub(null)}
              >
                Todos
              </button>
              {SUB_FILTERS[activeCat].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  className={activeSub === sub.id ? "active" : ""}
                  onClick={() =>
                    setActiveSub((p) => (p === sub.id ? null : sub.id))
                  }
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          <div className="fh-matchday">
            <h2 className="fh-matchday-header">
              {dayTitle} <span className="fh-md-count">({visibleEvents.length})</span>
            </h2>

            {loading ? (
              <div className="fh-empty">Cargando partidos...</div>
            ) : loadError ? (
              <div className="fh-empty">
                <p>No se pudieron cargar los eventos.</p>
                <p style={{ fontSize: "0.85em" }}>{loadError}</p>
                <button type="button" className="fh-btn fh-btn-primary" onClick={loadEvents}>
                  Reintentar
                </button>
              </div>
            ) : visibleEvents.length === 0 ? (
              <div className="fh-empty">
                <p>
                  {events.length === 0
                    ? "No hay eventos. Abre /api/cron para importar."
                    : "Sin eventos para este día o filtro."}
                </p>
                {events.length > 0 && (
                  <button type="button" className="fh-btn" onClick={resetFilters}>
                    Ver todo · Hoy
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

                {Object.entries(sections.other).map(([label, evs]) => (
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

          <p className="fh-footer">Qué ver hoy — horarios en península (España)</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0); // 0 = hoy, 1 = mañana, 2..6 = resto semana

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });
    setEvents(data || []);
    setLoading(false);
  }

  function getDateOffset(offset: number) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  }

  const days = [
    { label: "Hoy", short: "HOY", date: getDateOffset(0) },
    { label: "Mañana", short: "MAN", date: getDateOffset(1) },
    { label: "Pasado", short: "PAS", date: getDateOffset(2) },
    { label: getLabelForOffset(3), short: getShortDay(3), date: getDateOffset(3) },
    { label: getLabelForOffset(4), short: getShortDay(4), date: getDateOffset(4) },
    { label: getLabelForOffset(5), short: getShortDay(5), date: getDateOffset(5) },
    { label: getLabelForOffset(6), short: getShortDay(6), date: getDateOffset(6) },
  ];

  function getLabelForOffset(offset: number) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString("es-ES", { weekday: "long" });
  }

  function getShortDay(offset: number) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase().slice(0, 3);
  }

  const activeDate = days[activeDay].date;
  const visibleEvents = events.filter((e) => e.date === activeDate);

  // Agrupar por deporte/categoría si existe, si no mostrar todos juntos
  const grouped = visibleEvents.reduce((acc: Record<string, any[]>, e) => {
    const key = e.sport || e.category || "Eventos";
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const sportIcons: Record<string, string> = {
    Fútbol: "⚽",
    Tenis: "🎾",
    Baloncesto: "🏀",
    Fórmula1: "🏎️",
    Ciclismo: "🚴",
    Boxeo: "🥊",
    Golf: "⛳",
    Rugby: "🏉",
    Eventos: "📅",
  };

  return (
    <main style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Qué ver hoy</h1>
          <p style={styles.subtitle}>Eventos deportivos en directo</p>
        </div>
        <div style={styles.dot} />
      </header>

      {/* NAV DÍAS */}
      <nav style={styles.nav}>
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            style={{
              ...styles.dayBtn,
              ...(activeDay === i ? styles.dayBtnActive : {}),
            }}
          >
            <span style={styles.dayShort}>{i < 2 ? day.label : day.short}</span>
            <span style={styles.dayNum}>
              {new Date(day.date + "T12:00:00").getDate()}
            </span>
          </button>
        ))}
      </nav>

      {/* CONTENIDO */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.emptyState}>
            <div style={styles.spinner} />
            <p style={styles.emptyText}>Cargando...</p>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 40 }}>📭</span>
            <p style={styles.emptyText}>No hay eventos este día</p>
          </div>
        ) : (
          Object.entries(grouped).map(([sport, evs]) => (
            <section key={sport} style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sportIcon}>{sportIcons[sport] || "🏆"}</span>
                <h2 style={styles.sectionTitle}>{sport}</h2>
                <span style={styles.badge}>{evs.length}</span>
              </div>
              <div style={styles.list}>
                {evs.map((e) => (
                  <div key={e.id} style={styles.card}>
                    <div style={styles.cardLeft}>
                      <span style={styles.time}>{e.time?.slice(0, 5)}</span>
                      <div style={styles.liveDot} />
                    </div>
                    <div style={styles.cardBody}>
                      <p style={styles.eventTitle}>{e.title}</p>
                      {e.competition && (
                        <p style={styles.competition}>{e.competition}</p>
                      )}
                    </div>
                    <div style={styles.cardRight}>
                      <span style={styles.platform}>{e.platform}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "0 0 60px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#ffffff",
    color: "#111",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "36px 20px 20px",
    borderBottom: "1px solid #f0f0f0",
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.5px",
    color: "#0a0a0a",
  },
  subtitle: {
    fontSize: 13,
    color: "#999",
    margin: "4px 0 0",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
  },
  nav: {
    display: "flex",
    gap: 4,
    padding: "12px 16px",
    overflowX: "auto",
    borderBottom: "1px solid #f0f0f0",
    scrollbarWidth: "none",
  },
  dayBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "8px 14px",
    borderRadius: 12,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    minWidth: 56,
    transition: "all 0.15s",
    color: "#888",
  },
  dayBtnActive: {
    background: "#0a0a0a",
    color: "#fff",
  },
  dayShort: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  dayNum: {
    fontSize: 18,
    fontWeight: 700,
  },
  content: {
    padding: "16px 20px",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sportIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: "#555",
    margin: 0,
  },
  badge: {
    fontSize: 11,
    fontWeight: 600,
    color: "#aaa",
    background: "#f4f4f4",
    borderRadius: 99,
    padding: "1px 7px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid #f0f0f0",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "13px 16px",
    background: "#fff",
    borderBottom: "1px solid #f5f5f5",
    transition: "background 0.1s",
  },
  cardLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    minWidth: 44,
  },
  time: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0a0a0a",
    fontVariantNumeric: "tabular-nums",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#e5e5e5",
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  competition: {
    fontSize: 12,
    color: "#aaa",
    margin: "2px 0 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardRight: {
    flexShrink: 0,
  },
  platform: {
    fontSize: 11,
    fontWeight: 600,
    color: "#666",
    background: "#f5f5f5",
    padding: "4px 10px",
    borderRadius: 99,
    whiteSpace: "nowrap",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "60px 20px",
    color: "#ccc",
  },
  emptyText: {
    fontSize: 14,
    margin: 0,
  },
  spinner: {
    width: 28,
    height: 28,
    border: "2px solid #f0f0f0",
    borderTop: "2px solid #0a0a0a",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};
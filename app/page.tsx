"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

// ─── Estructura de categorías ───────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "all",
    label: "Todo",
    icon: "◎",
    children: [],
  },
  {
    id: "deportes",
    label: "Deportes",
    icon: "🏆",
    children: [
      { id: "futbol", label: "Fútbol", icon: "⚽" },
      { id: "tenis", label: "Tenis", icon: "🎾" },
      { id: "basket", label: "Basket", icon: "🏀" },
      { id: "formula1", label: "F1", icon: "🏎️" },
      { id: "ciclismo", label: "Ciclismo", icon: "🚴" },
      { id: "otros_deportes", label: "Otros", icon: "🏅" },
    ],
  },
  {
    id: "esports",
    label: "E-Sports",
    icon: "🎮",
    children: [
      { id: "csgo", label: "CS2", icon: "🔫" },
      { id: "valorant", label: "Valorant", icon: "⚡" },
      { id: "lol", label: "LoL", icon: "⚔️" },
      { id: "dota2", label: "Dota 2", icon: "🛡️" },
      { id: "otros_esports", label: "Otros", icon: "🕹️" },
    ],
  },
];

const ALL_SUBCATEGORIES = CATEGORIES.flatMap((c) => c.children.map((s) => s.id));

function getChildIds(catId: string): string[] {
  const cat = CATEGORIES.find((c) => c.id === catId);
  return cat ? cat.children.map((c) => c.id) : [];
}

function getDateOffset(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

function getShortDay(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "").toUpperCase();
}

const DAYS = Array.from({ length: 7 }, (_, i) => ({
  label: i === 0 ? "Hoy" : i === 1 ? "Mañana" : getShortDay(i),
  date: getDateOffset(i),
  num: new Date(getDateOffset(i) + "T12:00:00").getDate(),
}));

// ─── Componente principal ────────────────────────────────────────────────────
export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [activeCat, setActiveCat] = useState<string>("all"); // grupo padre activo
  const [activeSub, setActiveSub] = useState<string | null>(null); // subcategoría activa

  // Cargar preferencias guardadas
  useEffect(() => {
    try {
      const saved = localStorage.getItem("qvh_filters");
      if (saved) {
        const { cat, sub } = JSON.parse(saved);
        if (cat) setActiveCat(cat);
        if (sub) setActiveSub(sub);
      }
    } catch {}
    loadEvents();
  }, []);

  // Guardar preferencias cuando cambian
  useEffect(() => {
    try {
      localStorage.setItem("qvh_filters", JSON.stringify({ cat: activeCat, sub: activeSub }));
    } catch {}
  }, [activeCat, activeSub]);

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

  function selectCat(catId: string) {
    setActiveCat(catId);
    setActiveSub(null);
  }

  function selectSub(subId: string) {
    setActiveSub((prev) => (prev === subId ? null : subId));
  }

  // Filtrado
  const dayEvents = events.filter((e) => e.date === DAYS[activeDay].date);

  const visibleEvents = dayEvents.filter((e) => {
    if (activeCat === "all") return true;
    if (activeSub) return e.sport === activeSub;
    const children = getChildIds(activeCat);
    return children.includes(e.sport) || e.category === activeCat;
  });

  // Agrupación por deporte para mostrar
  const grouped = visibleEvents.reduce((acc: Record<string, any[]>, e) => {
    const key = e.sport || e.category || "Otros";
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const sportMeta: Record<string, { label: string; icon: string }> = {
    futbol: { label: "Fútbol", icon: "⚽" },
    tenis: { label: "Tenis", icon: "🎾" },
    basket: { label: "Basket", icon: "🏀" },
    formula1: { label: "Fórmula 1", icon: "🏎️" },
    ciclismo: { label: "Ciclismo", icon: "🚴" },
    csgo: { label: "CS2", icon: "🔫" },
    valorant: { label: "Valorant", icon: "⚡" },
    lol: { label: "League of Legends", icon: "⚔️" },
    dota2: { label: "Dota 2", icon: "🛡️" },
  };

  const activeGroup = CATEGORIES.find((c) => c.id === activeCat);

  return (
    <main style={s.page}>
      {/* ── HEADER ── */}
      <header style={s.header}>
        <div>
          <h1 style={s.h1}>Qué ver hoy</h1>
          <p style={s.sub}>Eventos deportivos y e-sports</p>
        </div>
        <span style={s.livePill}>
          <span style={s.liveDot} />
          EN DIRECTO
        </span>
      </header>

      {/* ── FILTROS DE CATEGORÍA (nivel 1) ── */}
      <div style={s.filterRow}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => selectCat(cat.id)}
            style={{
              ...s.filterBtn,
              ...(activeCat === cat.id ? s.filterBtnOn : {}),
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* ── SUBCATEGORÍAS (nivel 2, solo si hay hijas) ── */}
      {activeGroup && activeGroup.children.length > 0 && (
        <div style={s.subRow}>
          {activeGroup.children.map((sub) => (
            <button
              key={sub.id}
              onClick={() => selectSub(sub.id)}
              style={{
                ...s.subBtn,
                ...(activeSub === sub.id ? s.subBtnOn : {}),
              }}
            >
              {sub.icon} {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* ── DÍAS ── */}
      <div style={s.dayRow}>
        {DAYS.map((day, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            style={{
              ...s.dayBtn,
              ...(activeDay === i ? s.dayBtnOn : {}),
            }}
          >
            <span style={s.dayLabel}>{day.label}</span>
            <span style={s.dayNum}>{day.num}</span>
          </button>
        ))}
      </div>

      {/* ── EVENTOS ── */}
      <div style={s.content}>
        {loading ? (
          <div style={s.empty}>
            <div style={s.spinner} />
            <p style={s.emptyTxt}>Cargando...</p>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: 36 }}>📭</span>
            <p style={s.emptyTxt}>Sin eventos para este filtro</p>
          </div>
        ) : (
          Object.entries(grouped).map(([sport, evs]) => {
            const meta = sportMeta[sport] || { label: sport, icon: "🏆" };
            return (
              <section key={sport} style={s.section}>
                <div style={s.sectionHead}>
                  <span>{meta.icon}</span>
                  <span style={s.sectionTitle}>{meta.label}</span>
                  <span style={s.count}>{evs.length}</span>
                </div>
                <div style={s.list}>
                  {evs.map((e, idx) => (
                    <div
                      key={e.id}
                      style={{
                        ...s.card,
                        ...(idx === evs.length - 1 ? { borderBottom: "none" } : {}),
                      }}
                    >
                      <span style={s.cardTime}>{e.time?.slice(0, 5)}</span>
                      <div style={s.cardBody}>
                        <p style={s.cardTitle}>{e.title}</p>
                        {e.competition && (
                          <p style={s.cardComp}>{e.competition}</p>
                        )}
                      </div>
                      {e.platform && (
                        <span style={s.pill}>{e.platform}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #f7f7f8; }
      `}</style>
    </main>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 680,
    margin: "0 auto",
    minHeight: "100vh",
    background: "#fff",
    fontFamily: "'Geist', 'SF Pro Display', -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "32px 20px 18px",
    borderBottom: "1px solid #f0f0f0",
  },
  h1: {
    fontSize: 24,
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.5px",
    color: "#0a0a0a",
  },
  sub: { fontSize: 13, color: "#aaa", margin: "3px 0 0" },
  livePill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "1px",
    color: "#16a34a",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 99,
    padding: "5px 10px",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#16a34a",
    animation: "pulse 2s infinite",
  },

  // Filtros nivel 1
  filterRow: {
    display: "flex",
    gap: 6,
    padding: "14px 16px 0",
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  filterBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 14px",
    borderRadius: 99,
    border: "1.5px solid #ebebeb",
    background: "#fff",
    fontSize: 13,
    fontWeight: 600,
    color: "#555",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    flexShrink: 0,
  },
  filterBtnOn: {
    background: "#0a0a0a",
    borderColor: "#0a0a0a",
    color: "#fff",
  },

  // Subcategorías nivel 2
  subRow: {
    display: "flex",
    gap: 6,
    padding: "10px 16px 0",
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  subBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "5px 12px",
    borderRadius: 99,
    border: "1.5px solid #ebebeb",
    background: "#fafafa",
    fontSize: 12,
    fontWeight: 500,
    color: "#777",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    flexShrink: 0,
  },
  subBtnOn: {
    background: "#f0f0f0",
    borderColor: "#ccc",
    color: "#0a0a0a",
    fontWeight: 700,
  },

  // Días
  dayRow: {
    display: "flex",
    gap: 4,
    padding: "14px 16px 12px",
    overflowX: "auto",
    scrollbarWidth: "none",
    borderBottom: "1px solid #f0f0f0",
  },
  dayBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "7px 13px",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#aaa",
    flexShrink: 0,
    transition: "all 0.15s",
  },
  dayBtnOn: { background: "#0a0a0a", color: "#fff" },
  dayLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" },
  dayNum: { fontSize: 18, fontWeight: 800 },

  // Contenido
  content: { padding: "16px 20px 40px" },
  section: { marginBottom: 24 },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: "#666",
    flex: 1,
  },
  count: {
    fontSize: 11,
    fontWeight: 600,
    color: "#bbb",
    background: "#f5f5f5",
    borderRadius: 99,
    padding: "1px 8px",
  },
  list: {
    border: "1px solid #f0f0f0",
    borderRadius: 12,
    overflow: "hidden",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderBottom: "1px solid #f5f5f5",
    background: "#fff",
  },
  cardTime: {
    fontSize: 13,
    fontWeight: 700,
    color: "#111",
    minWidth: 40,
    fontVariantNumeric: "tabular-nums",
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardComp: {
    fontSize: 12,
    color: "#bbb",
    margin: "2px 0 0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  pill: {
    fontSize: 11,
    fontWeight: 600,
    color: "#666",
    background: "#f5f5f5",
    padding: "4px 10px",
    borderRadius: 99,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  // Estados
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "60px 20px",
    color: "#ddd",
  },
  emptyTxt: { fontSize: 14, color: "#ccc", margin: 0 },
  spinner: {
    width: 24,
    height: 24,
    border: "2px solid #f0f0f0",
    borderTop: "2px solid #0a0a0a",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};
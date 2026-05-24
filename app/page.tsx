"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);

      const today = new Date().toISOString().split("T")[0];

      const { data } = await supabase
        .from("events")
        .select("*")
        .order("time", { ascending: true });

      let eventsData = data || [];

      // auto-generate SOLO si no hay eventos hoy
      const todayEvents = eventsData.filter((e) => e.date === today);

      if (todayEvents.length === 0) {
        await fetch("/api/generate");

        const { data: newData } = await supabase
          .from("events")
          .select("*")
          .order("time", { ascending: true });

        eventsData = newData || [];
      }

      setEvents(eventsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const filtered =
    filter === "Todos"
      ? events
      : events.filter((e) => e.category === filter);

  const grouped = {
    today: filtered.filter((e) => e.date === today),
    other: filtered.filter((e) => e.date !== today),
  };

  const Card = ({ event }: any) => (
    <div className="card">
      <div className="title">
        {event.featured ? "⭐ " : ""}{event.title}
      </div>

      <div className="meta">
        🕒 {event.time} · 📺 {event.platform}
      </div>

      <div className="tag">{event.category}</div>
    </div>
  );

  const categories = ["Todos", "Fútbol", "UFC", "Motos"];

  return (
    <main className="container">
      <header className="header">
        <h1>🔥 Qué ver hoy</h1>
        <p className="sub">Eventos deportivos y directos del día</p>
      </header>

      <div className="filters">
        {categories.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? "btn active" : "btn"}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p className="loading">Cargando eventos...</p>}

      <section>
        <h2>🔥 Hoy</h2>
        <div className="grid">
          {grouped.today.length === 0 && !loading && (
            <p className="empty">No hay eventos hoy</p>
          )}
          {grouped.today.map((e, i) => (
            <Card key={i} event={e} />
          ))}
        </div>
      </section>

      <section className="section">
        <h2>📅 Otros días</h2>
        <div className="grid">
          {grouped.other.length === 0 && !loading && (
            <p className="empty">No hay eventos futuros</p>
          )}
          {grouped.other.map((e, i) => (
            <Card key={i} event={e} />
          ))}
        </div>
      </section>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
          font-family: system-ui;
          background: #0b0b0f;
          color: white;
          min-height: 100vh;
        }

        .header h1 {
          font-size: 34px;
          margin: 0;
        }

        .sub {
          opacity: 0.6;
          margin-top: 6px;
        }

        .filters {
          display: flex;
          gap: 10px;
          margin: 20px 0;
          flex-wrap: wrap;
        }

        .btn {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid #2a2a2a;
          background: #15151b;
          color: white;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn:hover {
          transform: scale(1.05);
        }

        .active {
          background: white;
          color: black;
        }

        .grid {
          display: grid;
          gap: 12px;
        }

        .card {
          padding: 16px;
          border-radius: 16px;
          background: #15151b;
          border: 1px solid #2a2a2a;
          transition: 0.2s;
        }

        .card:hover {
          transform: translateY(-2px);
          border-color: #444;
        }

        .title {
          font-size: 18px;
          font-weight: 600;
        }

        .meta {
          opacity: 0.7;
          margin-top: 6px;
          font-size: 13px;
        }

        .tag {
          margin-top: 8px;
          font-size: 12px;
          opacity: 0.5;
        }

        .section {
          margin-top: 30px;
        }

        .loading {
          opacity: 0.7;
        }

        .empty {
          opacity: 0.5;
        }
      `}</style>
    </main>
  );
}
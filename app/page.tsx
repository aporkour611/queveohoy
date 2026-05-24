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
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("events")
      .select("*")
      .order("time", { ascending: true });

    const eventsData = data || [];

    const todayEvents = eventsData.filter((e) => e.date === today);

    // 🔥 auto-generate si vacío hoy
    if (todayEvents.length === 0) {
      await fetch("/api/generate");

      const { data: newData } = await supabase
        .from("events")
        .select("*")
        .order("time", { ascending: true });

      setEvents(newData || []);
    } else {
      setEvents(eventsData);
    }

    setLoading(false);
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
        {event.featured && "⭐ "} {event.title}
      </div>
      <div className="meta">
        🕒 {event.time} · 📺 {event.platform}
      </div>
      <div className="tag">{event.category}</div>
    </div>
  );

  return (
    <main className="container">
      <h1 className="h1">🔥 Qué ver hoy</h1>

      <div className="filters">
        {["Todos", "Fútbol", "UFC", "Motos"].map((f) => (
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

      <h2>🔥 Hoy</h2>
      <div className="grid">
        {grouped.today.map((e, i) => (
          <Card key={i} event={e} />
        ))}
      </div>

      <h2 className="section">📅 Otros días</h2>
      <div className="grid">
        {grouped.other.map((e, i) => (
          <Card key={i} event={e} />
        ))}
      </div>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
          font-family: system-ui;
          background: #0f0f0f;
          color: white;
          min-height: 100vh;
        }

        .h1 {
          font-size: 32px;
          margin-bottom: 20px;
        }

        .filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid #333;
          background: #1a1a1a;
          color: white;
          cursor: pointer;
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
          border-radius: 14px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
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
          opacity: 0.6;
        }

        .section {
          margin-top: 30px;
        }

        .loading {
          opacity: 0.7;
        }
      `}</style>
    </main>
  );
}
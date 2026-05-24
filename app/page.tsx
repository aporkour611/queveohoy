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

    const { data } = await supabase.from("events").select("*");

    // 🔥 orden real tipo “producto”
    const sorted = (data || []).sort((a, b) => {
      const scoreA = (b.clicks || 0) + (b.featured ? 5 : 0);
      const scoreB = (a.clicks || 0) + (a.featured ? 5 : 0);
      return scoreA - scoreB;
    });

    setEvents(sorted);
    setLoading(false);
  }

  async function handleClick(event: any) {
    // subir clicks
    await supabase
      .from("events")
      .update({ clicks: (event.clicks || 0) + 1 })
      .eq("id", event.id);

    loadEvents();
  }

  const categories = ["Todos", "Fútbol", "UFC", "Motos"];

  const filtered =
    filter === "Todos"
      ? events
      : events.filter((e) => e.category === filter);

  return (
    <main className="container">
      <header className="header">
        <h1>🔥 Qué ver hoy</h1>
        <p>Eventos reales ordenados por popularidad</p>
      </header>

      <div className="filters">
        {categories.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? "active" : ""}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p>Cargando eventos...</p>}

      <div className="grid">
        {filtered.map((e) => (
          <div
            key={e.id}
            className="card"
            onClick={() => handleClick(e)}
          >
            <h3>
              {e.featured ? "⭐ " : ""}
              {e.title}
            </h3>

            <p>🕒 {e.time}</p>
            <p>📺 {e.platform}</p>

            <div className="footer">
              🔥 Popularidad: {e.clicks || 0}
            </div>
          </div>
        ))}
      </div>

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

        .header p {
          opacity: 0.6;
        }

        .filters {
          display: flex;
          gap: 10px;
          margin: 20px 0;
          flex-wrap: wrap;
        }

        button {
          padding: 8px 14px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          background: #1a1a1a;
          color: white;
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
          cursor: pointer;
          transition: 0.2s;
        }

        .card:hover {
          transform: translateY(-2px);
        }

        .footer {
          margin-top: 8px;
          font-size: 12px;
          opacity: 0.7;
        }
      `}</style>
    </main>
  );
}
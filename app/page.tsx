"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const today = new Date().toISOString().split("T")[0];

  const todayEvents = events.filter((e) => e.date === today);

  const featured = todayEvents[0];
  const rest = todayEvents.slice(1);

  return (
    <main className="container">
      <header className="header">
        <h1>🔥 Qué ver hoy</h1>
        <p>Partidos y eventos en directo</p>
      </header>

      {loading && <p>Cargando...</p>}

      {/* 🔥 DESTACADO PRINCIPAL */}
      {featured && (
        <div className="hero">
          <div className="hero-title">⭐ {featured.title}</div>
          <div className="hero-meta">
            🕒 {featured.time} · 📺 {featured.platform}
          </div>
        </div>
      )}

      {/* 🔥 LISTA PRINCIPAL */}
      <section>
        <h2>Hoy</h2>

        {todayEvents.length === 0 && !loading && (
          <p>No hay eventos hoy</p>
        )}

        <div className="list">
          {rest.map((e) => (
            <div key={e.id} className="card">
              <div className="title">{e.title}</div>
              <div className="meta">
                🕒 {e.time} · 📺 {e.platform}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 OTROS DÍAS */}
      <section>
        <h2>Próximamente</h2>

        <div className="list">
          {events
            .filter((e) => e.date !== today)
            .slice(0, 10)
            .map((e) => (
              <div key={e.id} className="card small">
                <div className="title">{e.title}</div>
                <div className="meta">
                  📅 {e.date} · 🕒 {e.time}
                </div>
              </div>
            ))}
        </div>
      </section>

      <style jsx>{`
        .container {
          max-width: 750px;
          margin: 0 auto;
          padding: 20px;
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
          margin-top: 5px;
        }

        .hero {
          margin-top: 20px;
          padding: 18px;
          border-radius: 14px;
          background: #1a1a1a;
          border: 1px solid #333;
        }

        .hero-title {
          font-size: 18px;
          font-weight: 700;
        }

        .hero-meta {
          margin-top: 6px;
          opacity: 0.7;
        }

        h2 {
          margin-top: 25px;
          font-size: 16px;
          opacity: 0.8;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
        }

        .card {
          padding: 14px;
          border-radius: 12px;
          background: #15151b;
          border: 1px solid #2a2a2a;
        }

        .card.small {
          opacity: 0.85;
          padding: 12px;
        }

        .title {
          font-size: 15px;
          font-weight: 600;
        }

        .meta {
          margin-top: 4px;
          font-size: 13px;
          opacity: 0.7;
        }
      `}</style>
    </main>
  );
}
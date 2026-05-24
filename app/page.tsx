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
  const tomorrowEvents = events.filter((e) => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return e.date === t.toISOString().split("T")[0];
  });

  return (
    <main className="container">
      <header className="header">
        <h1>Qué ver hoy</h1>
        <p>Eventos deportivos del día</p>
      </header>

      {loading && <p className="loading">Cargando...</p>}

      {/* HOY */}
      <section className="section">
        <h2>Hoy</h2>

        {!loading && todayEvents.length === 0 && (
          <p className="empty">No hay eventos hoy</p>
        )}

        <div className="list">
          {todayEvents.map((e) => (
            <div key={e.id} className="card">
              <div className="title">{e.title}</div>
              <div className="meta">
                🕒 {e.time} · 📺 {e.platform}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MAÑANA */}
      <section className="section">
        <h2>Mañana</h2>

        {!loading && tomorrowEvents.length === 0 && (
          <p className="empty">No hay eventos mañana</p>
        )}

        <div className="list">
          {tomorrowEvents.map((e) => (
            <div key={e.id} className="card">
              <div className="title">{e.title}</div>
              <div className="meta">
                🕒 {e.time} · 📺 {e.platform}
              </div>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .container {
          max-width: 720px;
          margin: 0 auto;
          padding: 20px;
          font-family: system-ui;
          background: #0b0b0f;
          color: white;
          min-height: 100vh;
        }

        .header h1 {
          font-size: 32px;
          margin: 0;
          font-weight: 800;
        }

        .header p {
          opacity: 0.6;
          margin-top: 6px;
        }

        .section {
          margin-top: 26px;
        }

        h2 {
          font-size: 14px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 10px;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .card {
          padding: 14px;
          border-radius: 12px;
          background: #15151b;
          border: 1px solid #2a2a2a;
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
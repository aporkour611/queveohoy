"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    autoUpdateThenLoad();
  }, []);

  async function autoUpdateThenLoad() {
    setLoading(true);

    // 🔥 actualiza datos al entrar (sin cron)
    try {
      await fetch("/api/generate");
    } catch (e) {
      console.log("update skipped");
    }

    // cargar datos
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    setEvents(data || []);
    setLoading(false);
  }

  const today = new Date().toISOString().split("T")[0];

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  const todayEvents = events.filter((e) => e.date === today);
  const tomorrowEvents = events.filter((e) => e.date === tomorrow);

  const Card = ({ e }: any) => (
    <div className="card">
      <div className="title">
        {e.featured ? "🔥 " : ""}
        {e.title}
      </div>
      <div className="meta">
        🕒 {e.time} · 📺 {e.platform}
      </div>
    </div>
  );

  return (
    <main className="container">
      <header className="header">
        <h1>🔥 Qué ver hoy</h1>
        <p>Actualizado automáticamente</p>
      </header>

      {loading && <p className="loading">Cargando eventos...</p>}

      {/* HOY */}
      <section className="section">
        <h2>Hoy</h2>

        {!loading && todayEvents.length === 0 && (
          <p className="empty">No hay eventos hoy</p>
        )}

        <div className="list">
          {todayEvents.map((e) => (
            <Card key={e.id} e={e} />
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
            <Card key={e.id} e={e} />
          ))}
        </div>
      </section>

      <style jsx>{`
        .container {
          max-width: 750px;
          margin: 0 auto;
          padding: 24px;
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
          margin-top: 6px;
          opacity: 0.6;
        }

        .section {
          margin-top: 28px;
        }

        h2 {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #888;
          margin-bottom: 12px;
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
          transition: 0.2s;
        }

        .card:hover {
          transform: translateY(-2px);
          border-color: #444;
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
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

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  const todayEvents = events.filter((e) => e.date === today);
  const tomorrowEvents = events.filter((e) => e.date === tomorrow);

  const mainToday = todayEvents[0];

  return (
    <main className="container">
      <header className="header">
        <h1>Qué ver hoy</h1>
        <p>Resumen rápido diario</p>
      </header>

      {loading && <p>Cargando...</p>}

      {/* 🔥 BLOQUE PRINCIPAL (HOY) */}
      <section className="block">
        <h2>Hoy</h2>

        {!mainToday && !loading && (
          <p className="empty">No hay eventos hoy</p>
        )}

        {mainToday && (
          <div className="hero">
            <div className="title">{mainToday.title}</div>
            <div className="meta">
              🕒 {mainToday.time} · 📺 {mainToday.platform}
            </div>
          </div>
        )}

        {todayEvents.length > 1 && (
          <div className="list">
            {todayEvents.slice(1).map((e) => (
              <div key={e.id} className="item">
                {e.title} · {e.time}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🔥 MAÑANA */}
      <section className="block">
        <h2>Mañana</h2>

        {tomorrowEvents.length === 0 && !loading && (
          <p className="empty">No hay eventos mañana</p>
        )}

        <div className="list">
          {tomorrowEvents.map((e) => (
            <div key={e.id} className="item">
              {e.title} · {e.time}
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .container {
          max-width: 650px;
          margin: 0 auto;
          padding: 24px;
          font-family: system-ui;
          background: white;
          color: black;
          min-height: 100vh;
        }

        .header {
          margin-bottom: 24px;
        }

        h1 {
          font-size: 34px;
          margin: 0;
          font-weight: 800;
        }

        .header p {
          color: #666;
          margin-top: 4px;
        }

        h2 {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #888;
          margin-bottom: 10px;
        }

        .block {
          margin-bottom: 28px;
        }

        .hero {
          padding: 16px;
          border: 1px solid #eee;
          border-radius: 12px;
          background: #fafafa;
        }

        .title {
          font-size: 16px;
          font-weight: 600;
        }

        .meta {
          margin-top: 6px;
          color: #666;
          font-size: 13px;
        }

        .list {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .item {
          font-size: 14px;
          color: #333;
          padding: 6px 0;
          border-bottom: 1px solid #f2f2f2;
        }

        .empty {
          color: #999;
          font-size: 14px;
        }
      `}</style>
    </main>
  );
}
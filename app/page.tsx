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

  const Card = ({ e }: any) => (
    <div className="card">
      <div className="title">{e.title}</div>
      <div className="meta">
        🕒 {e.time} · 📺 {e.platform}
      </div>
    </div>
  );

  return (
    <main className="container">
      <header className="header">
        <h1>Qué ver</h1>
        <p>Hoy y mañana</p>
      </header>

      {loading && <p>Cargando...</p>}

      {/* HOY */}
      <section>
        <h2>Hoy</h2>

        {todayEvents.length === 0 && !loading && (
          <p className="empty">No hay eventos hoy</p>
        )}

        <div className="list">
          {todayEvents.map((e) => (
            <Card key={e.id} e={e} />
          ))}
        </div>
      </section>

      {/* MAÑANA */}
      <section>
        <h2>Mañana</h2>

        {tomorrowEvents.length === 0 && !loading && (
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
          max-width: 720px;
          margin: 0 auto;
          padding: 24px;
          font-family: system-ui;
          background: white;
          color: black;
          min-height: 100vh;
        }

        .header {
          margin-bottom: 20px;
        }

        .header h1 {
          font-size: 32px;
          margin: 0;
          font-weight: 700;
        }

        .header p {
          margin-top: 4px;
          color: #666;
        }

        h2 {
          margin-top: 26px;
          font-size: 16px;
          font-weight: 600;
          border-bottom: 1px solid #eee;
          padding-bottom: 6px;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 12px;
        }

        .card {
          padding: 14px;
          border-radius: 10px;
          border: 1px solid #eee;
          background: #fafafa;
        }

        .title {
          font-size: 15px;
          font-weight: 600;
        }

        .meta {
          margin-top: 4px;
          font-size: 13px;
          color: #666;
        }

        .empty {
          color: #888;
          font-size: 14px;
        }
      `}</style>
    </main>
  );
}
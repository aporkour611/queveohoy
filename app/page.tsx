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
  const otherEvents = events.filter((e) => e.date !== today);

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
        <p>Eventos deportivos del día</p>
      </header>

      {loading && <p>Cargando...</p>}

      <section>
        <h2>Hoy</h2>
        {todayEvents.length === 0 && <p>No hay eventos hoy</p>}

        <div className="list">
          {todayEvents.map((e) => (
            <Card key={e.id} e={e} />
          ))}
        </div>
      </section>

      <section>
        <h2>Próximos días</h2>

        <div className="list">
          {otherEvents.map((e) => (
            <Card key={e.id} e={e} />
          ))}
        </div>
      </section>

      <style jsx>{`
        .container {
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
          font-family: system-ui;
          background: #0b0b0f;
          color: white;
          min-height: 100vh;
        }

        .header h1 {
          font-size: 30px;
          margin: 0;
        }

        .header p {
          opacity: 0.6;
          margin-top: 5px;
        }

        h2 {
          margin-top: 25px;
          font-size: 18px;
          opacity: 0.9;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .card {
          padding: 14px;
          border-radius: 12px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
        }

        .title {
          font-size: 16px;
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
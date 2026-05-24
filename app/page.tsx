"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("Todos");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const { data } = await supabase.from("events").select("*");
    setEvents(data || []);
  }

  const today = new Date().toISOString().split("T")[0];

  const filteredEvents =
    filter === "Todos"
      ? events
      : events.filter((e) => e.category === filter);

  const grouped = {
    today: filteredEvents.filter((e) => e.date === today),
    other: filteredEvents.filter((e) => e.date !== today),
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Eventos</h1>

      {/* 🔥 filtros */}
      <div style={{ marginBottom: 20 }}>
        {["Todos", "Fútbol", "UFC", "Motos"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              marginRight: 10,
              padding: 8,
              background: filter === f ? "#000" : "#eee",
              color: filter === f ? "#fff" : "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 🔥 HOY */}
      <h2>🔥 Hoy</h2>
      {grouped.today.length === 0 && <p>No hay eventos hoy</p>}

      {grouped.today.map((event, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <h3>{event.title}</h3>
          <p>{event.time}</p>
          <p>{event.category}</p>
          <p>{event.platform}</p>
        </div>
      ))}

      {/* 🔥 OTROS */}
      <h2 style={{ marginTop: 30 }}>📅 Otros días</h2>

      {grouped.other.length === 0 && <p>No hay otros eventos</p>}

      {grouped.other.map((event, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <h3>{event.title}</h3>
          <p>{event.time}</p>
          <p>{event.category}</p>
          <p>{event.platform}</p>
        </div>
      ))}
    </main>
  );
}
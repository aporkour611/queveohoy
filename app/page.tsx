"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState("Todos");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const today = new Date().toISOString().split("T")[0];

    // 🔥 1. cargar eventos
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("time", { ascending: true });

    setEvents(data || []);

    // 🔥 2. si no hay eventos hoy → generar automáticamente
    const todayEvents = (data || []).filter((e) => e.date === today);

    if (todayEvents.length === 0) {
      await fetch("/api/generate");

      const { data: newData } = await supabase
        .from("events")
        .select("*")
        .order("time", { ascending: true });

      setEvents(newData || []);
    }
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

  const renderEvent = (event: any, i: number) => (
    <div
      key={i}
      style={{
        marginBottom: 10,
        padding: 12,
        borderRadius: 10,
        border: event.featured ? "2px solid gold" : "1px solid #ddd",
        background: event.featured ? "#fff8dc" : "#fff",
      }}
    >
      <h3>
        {event.featured && "⭐ "}
        {event.title}
      </h3>
      <p>🕒 {event.time}</p>
      <p>🏷 {event.category}</p>
      <p>📺 {event.platform}</p>
    </div>
  );

  return (
    <main style={{ padding: 20 }}>
      <h1>Eventos</h1>

      {/* filtros */}
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
              borderRadius: 6,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <h2>🔥 Hoy</h2>
      {grouped.today.map(renderEvent)}

      <h2 style={{ marginTop: 30 }}>📅 Otros días</h2>
      {grouped.other.map(renderEvent)}
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function loadEvents() {
      const { data } = await supabase.from("events").select("*");
      setEvents(data || []);
    }

    loadEvents();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Eventos del día</h1>

      {events.map((event, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <h3>{event.title}</h3>
          <p>{event.time}</p>
          <p>{event.category}</p>
        </div>
      ))}
    </main>
  );
}
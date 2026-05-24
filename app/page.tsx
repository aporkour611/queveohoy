"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  useEffect(() => {
    async function loadEvents() {
      const { data } = await supabase.from("events").select("*");
      setEvents(data || []);
    }

    loadEvents();
  }, []);

  const categories = ["Todos", "Fútbol", "UFC", "Motos", "Streaming"];

  const filteredEvents =
    selectedCategory === "Todos"
      ? events
      : events.filter((e) => e.category === selectedCategory);

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-6">

      <h1 className="text-3xl font-bold mb-4">Qué ver hoy</h1>

      {/* FILTROS */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-white text-black"
                : "bg-white/10 text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* EVENTOS */}
      <div className="space-y-4">
        {filteredEvents.map((event: any) => (
          <div
            key={event.id}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <p className="text-sm text-zinc-400">
                  {event.category} · {event.platform}
                </p>
              </div>
              <div className="font-bold">{event.time}</div>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
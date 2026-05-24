"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminPage() {
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [category, setCategory] = useState("");
    const [platform, setPlatform] = useState("");
  
    async function addEvent() {
      const { error } = await supabase.from("events").insert([
        {
          title,
          time,
          category,
          platform,
        },
      ]);
  
      if (error) {
        alert("Error: " + error.message);
      } else {
        alert("Evento añadido 👍");
        setTitle("");
        setTime("");
        setCategory("");
        setPlatform("");
      }
    }
  
    // 🚀 AÑADE ESTO NUEVO AQUÍ 👇
    async function generateEvents() {
      const sampleEvents = [
        {
          title: "Real Madrid vs Barcelona",
          time: "20:00",
          category: "Fútbol",
          platform: "Movistar+",
        },
        {
          title: "UFC Fight Night",
          time: "22:00",
          category: "UFC",
          platform: "DAZN",
        },
        {
          title: "MotoGP Qualifying",
          time: "18:00",
          category: "Motos",
          platform: "DAZN",
        },
      ];
  
      const { error } = await supabase
        .from("events")
        .insert(sampleEvents);
  
      if (error) {
        alert("Error: " + error.message);
      } else {
        alert("Eventos generados 👍");
      }
    }
  
    return (
    <main className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin - Añadir evento</h1>
      <button
  onClick={generateEvents}
  className="bg-purple-600 p-2 rounded mt-4"
>
  Generar eventos del día
</button>
      <div className="flex flex-col gap-3 max-w-md">
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 text-black"
        />

        <input
          placeholder="Hora (ej: 20:00)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="p-2 text-black"
        />

        <input
          placeholder="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 text-black"
        />

        <input
          placeholder="Plataforma"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="p-2 text-black"
        />

        <button
          onClick={addEvent}
          className="bg-green-600 p-2 rounded"
        >
          Añadir evento
        </button>
      </div>
    </main>
  );
}

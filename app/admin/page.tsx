"use client";

import { useState } from "react";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [saving, setSaving] = useState(false);

  async function addEvent() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, time, category, platform }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        alert("Error: " + (data.error ?? res.statusText));
        return;
      }

      alert("Evento añadido");
      setTitle("");
      setTime("");
      setCategory("");
      setPlatform("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin — Añadir evento</h1>
      <p className="mb-6 max-w-md text-sm text-neutral-400">
        Los cambios se guardan en el servidor con permisos de administrador.
      </p>
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
          placeholder="Categoría / deporte"
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
          type="button"
          onClick={addEvent}
          disabled={saving || !title.trim()}
          className="bg-green-600 p-2 rounded disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Añadir evento"}
        </button>
      </div>
    </main>
  );
}

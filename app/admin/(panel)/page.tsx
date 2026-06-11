"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCronDashboard } from "@/app/components/AdminCronDashboard";
import { AdminWebhookHistory } from "@/app/components/AdminWebhookHistory";

type AdminTab = "add" | "list" | "cron";

type AdminEventRow = {
  id: number;
  title: string;
  date: string | null;
  time: string | null;
  sport: string | null;
  platform: string | null;
  created_at: string | null;
};

type EditDraft = {
  title: string;
  date: string;
  time: string;
  sport: string;
  platform: string;
};

const emptyDraft = (): EditDraft => ({
  title: "",
  date: "",
  time: "",
  sport: "",
  platform: "",
});

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("add");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>(emptyDraft);
  const [savingEdit, setSavingEdit] = useState(false);
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<string>("");
  const [cronRefreshKey, setCronRefreshKey] = useState(0);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const params = new URLSearchParams({ limit: "60" });
      if (filterDate.trim()) params.set("date", filterDate.trim());
      if (filterSport.trim()) params.set("sport", filterSport.trim());

      const res = await fetch(`/api/admin/events?${params.toString()}`);
      const data = (await res.json()) as {
        events?: AdminEventRow[];
        error?: string;
      };
      if (!res.ok) {
        console.error(data.error ?? res.statusText);
        return;
      }
      setEvents(data.events ?? []);
    } finally {
      setLoadingEvents(false);
    }
  }, [filterDate, filterSport]);

  useEffect(() => {
    if (tab !== "list") return;

    let cancelled = false;
    void (async () => {
      setLoadingEvents(true);
      try {
        const params = new URLSearchParams({ limit: "60" });
        if (filterDate.trim()) params.set("date", filterDate.trim());
        if (filterSport.trim()) params.set("sport", filterSport.trim());

        const res = await fetch(`/api/admin/events?${params.toString()}`);
        const data = (await res.json()) as {
          events?: AdminEventRow[];
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          console.error(data.error ?? res.statusText);
          return;
        }
        setEvents(data.events ?? []);
      } finally {
        if (!cancelled) setLoadingEvents(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tab, filterDate, filterSport]);

  async function addEvent() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          time,
          category,
          platform,
          date: date || undefined,
        }),
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
      setDate("");
      setTab("list");
      await loadEvents();
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(id: number) {
    if (!window.confirm(`¿Eliminar evento #${id}?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        alert("Error: " + (data.error ?? res.statusText));
        return;
      }
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(event: AdminEventRow) {
    setEditingId(event.id);
    setEditDraft({
      title: event.title ?? "",
      date: event.date ?? "",
      time: event.time ?? "",
      sport: event.sport ?? "",
      platform: event.platform ?? "",
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editDraft }),
      });
      const data = (await res.json()) as {
        error?: string;
        event?: AdminEventRow;
      };
      if (!res.ok) {
        alert("Error: " + (data.error ?? res.statusText));
        return;
      }
      if (data.event) {
        setEvents((prev) =>
          prev.map((row) => (row.id === editingId ? data.event! : row))
        );
      }
      setEditingId(null);
    } finally {
      setSavingEdit(false);
    }
  }

  async function runCronNow() {
    setCronRunning(true);
    setCronResult("");
    try {
      const res = await fetch("/api/admin/cron", { method: "POST" });
      const data = (await res.json()) as Record<string, unknown> & {
        error?: string;
      };
      if (!res.ok) {
        setCronResult(data.error ?? `Error ${res.status}`);
        return;
      }
      setCronResult(JSON.stringify(data, null, 2));
      setCronRefreshKey((k) => k + 1);
    } catch (error) {
      setCronResult(error instanceof Error ? error.message : String(error));
    } finally {
      setCronRunning(false);
    }
  }

  return (
    <main className="p-6 text-white bg-black min-h-screen">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Admin</h1>
        <form action="/api/admin/logout" method="post">
          <button type="submit" className="text-sm text-neutral-400 underline">
            Cerrar sesión
          </button>
        </form>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {(
          [
            ["add", "Añadir"],
            ["list", "Listado"],
            ["cron", "Cron"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded px-4 py-2 text-sm ${
              tab === id
                ? "bg-green-600 text-white"
                : "bg-neutral-800 text-neutral-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "add" ? (
        <section className="max-w-md">
          <h2 className="mb-3 text-lg font-semibold">Añadir manual</h2>
          <p className="mb-4 text-sm text-neutral-400">
            Los cambios se guardan en el servidor con permisos de administrador.
          </p>
          <div className="flex flex-col gap-3">
            <input
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2 text-black"
            />
            <input
              placeholder="Fecha (YYYY-MM-DD)"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              onClick={() => void addEvent()}
              disabled={saving || !title.trim()}
              className="bg-green-600 p-2 rounded disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Añadir evento"}
            </button>
          </div>
        </section>
      ) : null}

      {tab === "list" ? (
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-400">Fecha</span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="p-2 text-black"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-400">Sport</span>
              <input
                placeholder="futbol"
                value={filterSport}
                onChange={(e) => setFilterSport(e.target.value)}
                className="p-2 text-black"
              />
            </label>
            <button
              type="button"
              onClick={() => void loadEvents()}
              className="rounded bg-neutral-800 px-4 py-2 text-sm"
            >
              Actualizar
            </button>
          </div>

          {loadingEvents ? (
            <p className="text-sm text-neutral-400">Cargando…</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-neutral-400">No hay eventos.</p>
          ) : (
            <ul className="divide-y divide-neutral-800 rounded border border-neutral-800">
              {events.map((event) => (
                <li key={event.id} className="p-3 text-sm">
                  {editingId === event.id ? (
                    <div className="grid gap-2 md:grid-cols-2">
                      <input
                        value={editDraft.title}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, title: e.target.value }))
                        }
                        className="p-2 text-black md:col-span-2"
                        placeholder="Título"
                      />
                      <input
                        value={editDraft.date}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, date: e.target.value }))
                        }
                        className="p-2 text-black"
                        placeholder="Fecha"
                      />
                      <input
                        value={editDraft.time}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, time: e.target.value }))
                        }
                        className="p-2 text-black"
                        placeholder="Hora"
                      />
                      <input
                        value={editDraft.sport}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, sport: e.target.value }))
                        }
                        className="p-2 text-black"
                        placeholder="Sport"
                      />
                      <input
                        value={editDraft.platform}
                        onChange={(e) =>
                          setEditDraft((d) => ({
                            ...d,
                            platform: e.target.value,
                          }))
                        }
                        className="p-2 text-black"
                        placeholder="Plataforma"
                      />
                      <div className="flex flex-wrap gap-2 md:col-span-2">
                        <button
                          type="button"
                          onClick={() => void saveEdit()}
                          disabled={savingEdit}
                          className="rounded bg-green-600 px-3 py-1 disabled:opacity-50"
                        >
                          {savingEdit ? "Guardando…" : "Guardar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded bg-neutral-800 px-3 py-1"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-white">{event.title}</p>
                        <p className="text-neutral-400">
                          #{event.id}
                          {event.date ? ` · ${event.date}` : ""}
                          {event.time ? ` · ${event.time}` : ""}
                          {event.sport ? ` · ${event.sport}` : ""}
                          {event.platform ? ` · ${event.platform}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(event)}
                          className="text-neutral-300 underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteEvent(event.id)}
                          disabled={deletingId === event.id}
                          className="text-red-400 underline disabled:opacity-50"
                        >
                          {deletingId === event.id ? "Eliminando…" : "Eliminar"}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "cron" ? (
        <section className="max-w-4xl">
          <h2 className="mb-3 text-lg font-semibold">Cron — métricas y ejecución</h2>
          <AdminCronDashboard refreshKey={cronRefreshKey} />
          <h3 className="mb-2 mt-8 text-base font-semibold">
            Webhooks partners — historial
          </h3>
          <p className="mb-3 text-sm text-neutral-400">
            Últimas entregas de <code className="text-neutral-300">feed.updated</code>{" "}
            tras cada cron (Upstash, 40 entradas máx.).
          </p>
          <AdminWebhookHistory refreshKey={cronRefreshKey} />
          <h3 className="mb-2 mt-8 text-base font-semibold">Ejecución manual</h3>
          <p className="mb-4 text-sm text-neutral-400">
            Ejecuta la ingesta completa desde el servidor (requiere CRON_SECRET).
            El resumen se guarda en Upstash si está configurado.
          </p>
          <button
            type="button"
            onClick={() => void runCronNow()}
            disabled={cronRunning}
            className="rounded bg-green-600 px-4 py-2 disabled:opacity-50"
          >
            {cronRunning ? "Ejecutando…" : "Ejecutar cron ahora"}
          </button>
          {cronResult ? (
            <pre className="mt-4 max-h-[32rem] overflow-auto rounded border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-300">
              {cronResult}
            </pre>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

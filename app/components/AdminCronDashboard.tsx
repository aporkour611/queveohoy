"use client"

import { useCallback, useEffect, useState } from "react"
import type { CronMetricsSummary } from "@/app/lib/cron-metrics"

type CronStatusResponse = {
  version?: string
  storeConfigured?: boolean
  lastRun?: {
    savedAt: string
    metrics: CronMetricsSummary
  } | null
  live?: {
    feedReady: boolean
    feedEventCount: number
    database: boolean
    feedError: string | null
  }
  integrations?: Record<string, boolean>
  error?: string
}

function statusClass(status: "ok" | "warn" | "error"): string {
  if (status === "error") return "text-red-400"
  if (status === "warn") return "text-amber-400"
  return "text-emerald-400"
}

export function AdminCronDashboard({
  refreshKey = 0,
}: {
  refreshKey?: number
}) {
  const [data, setData] = useState<CronStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/cron/status", { cache: "no-store" })
      const body = (await res.json()) as CronStatusResponse
      if (!res.ok) {
        setData({ error: body.error ?? res.statusText })
        return
      }
      setData(body)
    } catch (err) {
      setData({
        error: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  if (loading) {
    return (
      <p className="text-sm text-neutral-400" aria-live="polite">
        Cargando métricas…
      </p>
    )
  }

  if (data?.error) {
    return (
      <p className="text-sm text-red-400" role="alert">
        {data.error}
      </p>
    )
  }

  const live = data?.live
  const metrics = data?.lastRun?.metrics

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-neutral-800 bg-neutral-950 p-3">
          <p className="text-xs text-neutral-500">Feed en vivo</p>
          <p
            className={`text-lg font-semibold ${
              live?.feedReady ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {live?.feedReady ? "OK" : "Degradado"}
          </p>
          <p className="text-xs text-neutral-400">
            {live?.feedEventCount ?? 0} eventos
          </p>
        </div>
        <div className="rounded border border-neutral-800 bg-neutral-950 p-3">
          <p className="text-xs text-neutral-500">Base de datos</p>
          <p
            className={`text-lg font-semibold ${
              live?.database ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {live?.database ? "Conectada" : "Error"}
          </p>
        </div>
        <div className="rounded border border-neutral-800 bg-neutral-950 p-3">
          <p className="text-xs text-neutral-500">Último cron guardado</p>
          <p className="text-lg font-semibold text-neutral-200">
            {metrics?.totalIngested ?? "—"}
          </p>
          <p className="text-xs text-neutral-400">
            {data?.lastRun?.savedAt
              ? new Date(data.lastRun.savedAt).toLocaleString("es-ES", {
                  timeZone: "Europe/Madrid",
                })
              : data?.storeConfigured
                ? "Sin ejecución aún"
                : "Upstash no configurado"}
          </p>
        </div>
      </div>

      {metrics ? (
        <div className="overflow-x-auto rounded border border-neutral-800">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-3 py-2 font-medium">Fuente</th>
                <th className="px-3 py-2 font-medium">Resultado</th>
                <th className="px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {metrics.rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-800">
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.value}</td>
                  <td className={`px-3 py-2 ${statusClass(r.status)}`}>
                    {r.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {metrics.alerts > 0 ? (
            <p className="border-t border-neutral-800 px-3 py-2 text-xs text-amber-400">
              {metrics.alerts} alerta(s) de salud en la última ejecución
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void load()}
        className="text-sm text-neutral-400 underline"
      >
        Actualizar métricas
      </button>
    </div>
  )
}

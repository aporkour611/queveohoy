"use client"

import { useCallback, useEffect, useState } from "react"
import type { PartnerWebhookHistoryEntry } from "@/app/lib/partner-webhook-history-store"

type HistoryResponse = {
  storeConfigured?: boolean
  entries?: PartnerWebhookHistoryEntry[]
  error?: string
}

function formatMadrid(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-ES", {
      timeZone: "Europe/Madrid",
    })
  } catch {
    return iso
  }
}

export function AdminWebhookHistory({
  refreshKey = 0,
}: {
  refreshKey?: number
}) {
  const [data, setData] = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/webhooks/history?limit=25", {
        cache: "no-store",
      })
      const body = (await res.json()) as HistoryResponse
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
        Cargando historial de webhooks…
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

  if (!data?.storeConfigured) {
    return (
      <p className="text-sm text-amber-400">
        Historial no disponible: configura{" "}
        <code className="text-neutral-300">UPSTASH_REDIS_REST_URL</code> y{" "}
        <code className="text-neutral-300">UPSTASH_REDIS_REST_TOKEN</code> (mismo
        Redis que el snapshot del cron).
      </p>
    )
  }

  const entries = data.entries ?? []

  if (entries.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Sin entregas registradas. Ejecuta un cron con partners que tengan URL de
        webhook en <code className="text-neutral-300">PARTNER_API_KEYS</code>.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded border border-neutral-800">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 font-medium">Cuándo</th>
              <th className="px-3 py-2 font-medium">Evento</th>
              <th className="px-3 py-2 font-medium">Resumen</th>
              <th className="px-3 py-2 font-medium">Partners</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={`${entry.at}-${entry.event}`}
                className="border-t border-neutral-800 align-top"
              >
                <td className="px-3 py-2 text-xs text-neutral-300">
                  {formatMadrid(entry.at)}
                </td>
                <td className="px-3 py-2">
                  <span className="font-mono text-xs">{entry.event}</span>
                  <p className="text-xs text-neutral-500">
                    {entry.date} · {entry.eventCount} evt · v{entry.version}
                  </p>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={
                      entry.failed === 0
                        ? "text-emerald-400"
                        : entry.sent === 0
                          ? "text-red-400"
                          : "text-amber-400"
                    }
                  >
                    {entry.sent}/{entry.configured} OK
                  </span>
                  {entry.failed > 0 ? (
                    <p className="text-xs text-red-400">{entry.failed} fallo(s)</p>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  <ul className="space-y-1 text-xs">
                    {entry.deliveries.map((d) => (
                      <li key={`${entry.at}-${d.partnerId}`}>
                        <span className="font-mono text-neutral-300">
                          {d.partnerId}
                        </span>{" "}
                        <span
                          className={d.ok ? "text-emerald-400" : "text-red-400"}
                        >
                          {d.ok
                            ? d.status
                              ? `HTTP ${d.status}`
                              : "ok"
                            : d.error ?? "error"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() => void load()}
        className="text-sm text-neutral-400 underline"
      >
        Actualizar historial
      </button>
    </div>
  )
}

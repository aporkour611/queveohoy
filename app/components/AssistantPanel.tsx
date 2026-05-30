"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { AssistantEventCard, AssistantReply } from "../lib/assistant-core"
import { useUserPlatforms } from "../lib/use-user-platforms"

const PRIME_TIME_KEY = "qvh-prime-time"

type Props = {
  compact?: boolean
}

export function AssistantPanel({ compact = false }: Props) {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [reply, setReply] = useState<AssistantReply | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const userPlatforms = useUserPlatforms()

  const handleSubmit = useCallback(async () => {
    const trimmed = query.trim()
    if (trimmed.length < 2 || loading) return

    setLoading(true)
    setError(null)

    try {
      let primeTime = "18:00"
      try {
        primeTime = localStorage.getItem(PRIME_TIME_KEY)?.slice(0, 5) || "18:00"
      } catch {
        /* ignore */
      }

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          platforms: userPlatforms,
          primeTime,
        }),
      })
      const body = (await res.json()) as AssistantReply & { error?: string }
      if (!res.ok) {
        throw new Error(body.error ?? "No se pudo consultar al asistente")
      }
      setReply(body)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al consultar")
    } finally {
      setLoading(false)
    }
  }, [query, loading, userPlatforms])

  useEffect(() => {
    if (!compact) inputRef.current?.focus()
  }, [compact])

  const suggestions = [
    "¿Qué veo esta noche?",
    "Partidos en mis plataformas",
    "Champions hoy",
  ]

  return (
    <div className={`qvh-assistant${compact ? " qvh-assistant-compact" : ""}`}>
      <div className="qvh-assistant-head">
        <p className="qvh-assistant-kicker">IA · v5.0</p>
        <h2 className="qvh-assistant-title">¿Qué veo?</h2>
        <p className="qvh-assistant-desc">
          Recomendaciones con datos reales de la agenda. Sin inventar horarios.
        </p>
      </div>

      <div className="qvh-assistant-suggestions" role="group" aria-label="Sugerencias">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            className="qvh-assistant-chip"
            onClick={() => {
              setQuery(item)
              setReply(null)
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <form
        className="qvh-assistant-form"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
      >
        <label className="sr-only" htmlFor="qvh-assistant-input">
          Pregunta al asistente
        </label>
        <input
          ref={inputRef}
          id="qvh-assistant-input"
          type="text"
          className="qvh-assistant-input"
          placeholder="Ej.: ¿Dónde veo el partido del Barça?"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          maxLength={500}
          autoComplete="off"
        />
        <button
          type="submit"
          className="fh-btn fh-btn-primary qvh-assistant-submit"
          disabled={loading || query.trim().length < 2}
        >
          {loading ? "Pensando…" : "Preguntar"}
        </button>
      </form>

      {error ? <p className="qvh-assistant-error">{error}</p> : null}

      {reply ? (
        <div className="qvh-assistant-reply">
          <p className="qvh-assistant-message">{reply.message}</p>
          {reply.source === "smart" ? (
            <p className="qvh-assistant-meta">
              Modo inteligente (sin OpenAI). Añade OPENAI_API_KEY para IA completa.
            </p>
          ) : (
            <p className="qvh-assistant-meta">Respuesta con IA · datos verificados</p>
          )}
          {reply.events.length > 0 ? (
            <ul className="qvh-assistant-events">
              {reply.events.map((event) => (
                <AssistantEventRow key={event.id} event={event} />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {!compact ? (
        <p className="qvh-assistant-foot">
          <Link href="/cuenta">Configura tus plataformas</Link> para mejores respuestas.
        </p>
      ) : null}
    </div>
  )
}

function AssistantEventRow({ event }: { event: AssistantEventCard }) {
  return (
    <li className="qvh-assistant-event">
      <Link href={event.url.replace(/^https?:\/\/[^/]+/, "")} className="qvh-assistant-event-link">
        <strong>{event.title}</strong>
        <span>
          {[event.time, event.platform].filter(Boolean).join(" · ")}
        </span>
      </Link>
    </li>
  )
}

export function AssistantFab() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        className="qvh-assistant-fab"
        aria-expanded={open}
        aria-controls="qvh-assistant-sheet"
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden>✦</span>
        <span className="qvh-assistant-fab-label">¿Qué veo?</span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="qvh-assistant-backdrop"
            aria-label="Cerrar asistente"
            onClick={() => setOpen(false)}
          />
          <div
            id="qvh-assistant-sheet"
            className="qvh-assistant-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qvh-assistant-sheet-title"
          >
            <div className="qvh-assistant-sheet-head">
              <h2 id="qvh-assistant-sheet-title" className="sr-only">
                Asistente ¿Qué veo?
              </h2>
              <button
                type="button"
                className="qvh-assistant-close"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <AssistantPanel compact />
          </div>
        </>
      ) : null}
    </>
  )
}

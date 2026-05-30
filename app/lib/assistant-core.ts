import type { EventRow } from "../components/types"
import { filterEventsByAgendaQuery } from "./agenda-search"
import { pickPersonalizedTonightEvents } from "./personalized-tonight"
import { eventDisplayTitle } from "./event-display"
import { partidoPath } from "./event-slug"
import { siteUrl } from "./seo"

export type AssistantEventCard = {
  id: number
  title: string
  time: string | null
  platform: string | null
  sport: string | null
  url: string
}

export type AssistantReply = {
  message: string
  events: AssistantEventCard[]
  source: "ai" | "smart"
}

export function toAssistantEventCards(events: EventRow[]): AssistantEventCard[] {
  return events
    .filter((event) => event.id && event.date)
    .slice(0, 8)
    .map((event) => ({
      id: event.id as number,
      title: eventDisplayTitle(event),
      time: event.time?.slice(0, 5) ?? null,
      platform: event.platform ?? null,
      sport: event.sport ?? null,
      url: `${siteUrl}${partidoPath(event)}`,
    }))
}

export function buildSmartAssistantReply(
  query: string,
  events: EventRow[],
  todayKey: string,
  options: {
    userPlatforms?: string[]
    primeTime?: string
  } = {}
): AssistantReply {
  const trimmed = query.trim().toLowerCase()

  if (
    /esta noche|tonight|prime time|prime-time|desde las \d|qué veo|que veo/.test(
      trimmed
    )
  ) {
    const tonight = pickPersonalizedTonightEvents(events, todayKey, {
      userPlatforms: options.userPlatforms,
      primeTime: options.primeTime,
      limit: 6,
    })
    if (tonight.length === 0) {
      return {
        message:
          "No encuentro eventos para esta noche con esos criterios. Prueba ampliar plataformas en tu cuenta o quita el filtro «Solo mis plataformas».",
        events: [],
        source: "smart",
      }
    }
    return {
      message: `Esta noche te recomiendo ${tonight.length} evento${tonight.length === 1 ? "" : "s"} desde las ${options.primeTime ?? "18:00"} h:`,
      events: toAssistantEventCards(tonight),
      source: "smart",
    }
  }

  if (/mis plataformas|donde puedo ver|tengo dazn|tengo movistar|netflix/.test(trimmed)) {
    const platforms = options.userPlatforms ?? []
    if (!platforms.length) {
      return {
        message:
          "Configura tus plataformas en /cuenta → Plataformas para que pueda filtrar dónde ver cada cosa.",
        events: [],
        source: "smart",
      }
    }
    const matched = events
      .filter((event) => event.date === todayKey)
      .filter((event) =>
        platforms.some((platform) =>
          (event.platform ?? "").toLowerCase().includes(platform.toLowerCase())
        )
      )
      .slice(0, 6)
    return {
      message: `En tus plataformas (${platforms.join(", ")}) hay ${matched.length} evento${matched.length === 1 ? "" : "s"} hoy:`,
      events: toAssistantEventCards(matched),
      source: "smart",
    }
  }

  const tokens = trimmed.replace(/[^\p{L}\p{N}\s+]/gu, " ").trim()
  if (tokens.length < 2) {
    return {
      message:
        "Pregúntame por un equipo, competición, «esta noche» o «mis plataformas». Ejemplo: «Champions esta noche».",
      events: [],
      source: "smart",
    }
  }

  const matched = filterEventsByAgendaQuery(events, tokens).slice(0, 6)
  if (matched.length === 0) {
    return {
      message: `No hay coincidencias para «${query.trim()}» en la agenda de hoy y próximos días.`,
      events: [],
      source: "smart",
    }
  }

  return {
    message: `Encontré ${matched.length} evento${matched.length === 1 ? "" : "s"} para «${query.trim()}»:`,
    events: toAssistantEventCards(matched),
    source: "smart",
  }
}

export const ASSISTANT_SYSTEM_PROMPT = `Eres el asistente «¿Qué veo?» de queveohoy.es — agenda de TV, streaming y deportes en España.
Reglas estrictas:
- NUNCA inventes horarios, canales ni plataformas. Solo usa datos de las herramientas.
- Responde en español, tono cercano y breve (máx. 3 frases).
- Si no hay datos, dilo claramente.
- Menciona siempre la plataforma/canal cuando recomiendes algo.
- Zona horaria: Europe/Madrid (península y Baleares).`

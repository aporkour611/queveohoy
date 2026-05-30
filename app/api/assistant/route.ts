import { openai } from "@ai-sdk/openai"
import { generateText, stepCountIs, tool } from "ai"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  ASSISTANT_SYSTEM_PROMPT,
  buildSmartAssistantReply,
  toAssistantEventCards,
} from "@/app/lib/assistant-core"
import { filterEventsByAgendaQuery } from "@/app/lib/agenda-search"
import { fetchFeedEvents } from "@/app/lib/events-feed-server"
import {
  filterEventsByUserPlatforms,
  pickPersonalizedTonightEvents,
} from "@/app/lib/personalized-tonight"
import { checkRateLimit, clientIp } from "@/app/lib/rate-limit"
import { getMadridTodayKey } from "@/app/lib/seo-date"

const ASSISTANT_RATE_LIMIT = 20
const ASSISTANT_WINDOW_MS = 60_000

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  const rate = checkRateLimit(`assistant:${ip}`, ASSISTANT_RATE_LIMIT, ASSISTANT_WINDOW_MS)
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Demasiadas peticiones. Espera un momento." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) },
      }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const query =
    typeof (body as { query?: unknown })?.query === "string"
      ? (body as { query: string }).query.trim()
      : ""
  if (query.length < 2 || query.length > 500) {
    return NextResponse.json(
      { error: "La pregunta debe tener entre 2 y 500 caracteres" },
      { status: 400 }
    )
  }

  const userPlatforms = Array.isArray((body as { platforms?: unknown }).platforms)
    ? ((body as { platforms: unknown[] }).platforms.filter(
        (item): item is string => typeof item === "string"
      ) as string[])
    : []
  const primeTime =
    typeof (body as { primeTime?: unknown }).primeTime === "string"
      ? (body as { primeTime: string }).primeTime.slice(0, 5)
      : "18:00"

  const { events, error } = await fetchFeedEvents()
  if (error) {
    return NextResponse.json({ error }, { status: 502 })
  }

  const todayKey = getMadridTodayKey()
  const apiKey = process.env.OPENAI_API_KEY?.trim()

  if (!apiKey) {
    const smart = buildSmartAssistantReply(query, events, todayKey, {
      userPlatforms,
      primeTime,
    })
    return NextResponse.json(smart)
  }

  let toolEvents: typeof events = []

  try {
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: ASSISTANT_SYSTEM_PROMPT,
      prompt: query,
      tools: {
        searchEvents: tool({
          description: "Busca eventos en la agenda por texto (equipos, competición, plataforma)",
          inputSchema: z.object({
            q: z.string().min(2).describe("Consulta de búsqueda"),
            limit: z.number().min(1).max(12).optional(),
          }),
          execute: async ({ q, limit = 6 }) => {
            toolEvents = filterEventsByAgendaQuery(events, q).slice(0, limit)
            return toAssistantEventCards(toolEvents)
          },
        }),
        tonightForYou: tool({
          description: "Eventos recomendados para esta noche según prime time y plataformas",
          inputSchema: z.object({
            limit: z.number().min(1).max(12).optional(),
          }),
          execute: async ({ limit = 6 }) => {
            toolEvents = pickPersonalizedTonightEvents(events, todayKey, {
              userPlatforms,
              primeTime,
              limit,
            })
            return toAssistantEventCards(toolEvents)
          },
        }),
        filterByPlatforms: tool({
          description: "Filtra eventos de hoy que coinciden con las plataformas del usuario",
          inputSchema: z.object({
            platforms: z.array(z.string()).min(1),
            limit: z.number().min(1).max(12).optional(),
          }),
          execute: async ({ platforms, limit = 6 }) => {
            toolEvents = filterEventsByUserPlatforms(
              events.filter((event) => event.date === todayKey),
              platforms
            ).slice(0, limit)
            return toAssistantEventCards(toolEvents)
          },
        }),
      },
      stopWhen: stepCountIs(3),
    })

    return NextResponse.json({
      message: result.text.trim() || "Aquí tienes lo que encontré en la agenda:",
      events: toAssistantEventCards(toolEvents),
      source: "ai" as const,
    })
  } catch {
    const smart = buildSmartAssistantReply(query, events, todayKey, {
      userPlatforms,
      primeTime,
    })
    return NextResponse.json(smart)
  }
}

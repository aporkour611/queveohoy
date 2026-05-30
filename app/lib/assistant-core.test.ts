import { describe, expect, it } from "vitest"
import type { EventRow } from "../components/types"
import { buildSmartAssistantReply, toAssistantEventCards } from "./assistant-core"

const sample: EventRow = {
  id: 42,
  title: "PSG vs Arsenal",
  sport: "futbol",
  date: "2026-05-30",
  time: "18:00",
  competition: "Champions League",
  home_team: "PSG",
  away_team: "Arsenal",
  platform: "DAZN",
}

describe("buildSmartAssistantReply", () => {
  it("responde a esta noche con eventos del prime time", () => {
    const reply = buildSmartAssistantReply(
      "¿Qué veo esta noche?",
      [sample],
      "2026-05-30",
      { primeTime: "18:00" }
    )
    expect(reply.source).toBe("smart")
    expect(reply.events.length).toBeGreaterThan(0)
    expect(reply.message.toLowerCase()).toContain("noche")
  })

  it("pide configurar plataformas si no hay ninguna", () => {
    const reply = buildSmartAssistantReply(
      "partidos en mis plataformas",
      [sample],
      "2026-05-30"
    )
    expect(reply.events).toEqual([])
    expect(reply.message).toContain("/cuenta")
  })

  it("busca por texto en agenda", () => {
    const reply = buildSmartAssistantReply("champions", [sample], "2026-05-30")
    expect(reply.events.length).toBe(1)
    expect(reply.events[0]?.title).toContain("PSG")
  })
})

describe("toAssistantEventCards", () => {
  it("mapea campos mínimos", () => {
    const cards = toAssistantEventCards([sample])
    expect(cards[0]).toMatchObject({
      id: 42,
      time: "18:00",
      platform: "DAZN",
    })
    expect(cards[0]?.url).toContain("/partido/")
  })
})

import { describe, expect, it } from "vitest"
import { parseNaturalAgendaQuery } from "./agenda-search-nl"

describe("parseNaturalAgendaQuery", () => {
  it("elimina stop words y expande alias", () => {
    const parsed = parseNaturalAgendaQuery("¿Dónde veo el partido del Barça?")
    expect(parsed.tokens).toContain("barcelona")
    expect(parsed.tokens).not.toContain("veo")
    expect(parsed.searchText).toContain("barcelona")
  })

  it("detecta plataforma en la pregunta", () => {
    const parsed = parseNaturalAgendaQuery("champions en dazn hoy")
    expect(parsed.platformHint).toBe("dazn")
    expect(parsed.tokens).toContain("champions")
  })

  it("detecta intención de prime time", () => {
    expect(parseNaturalAgendaQuery("qué veo esta noche").wantsTonight).toBe(true)
    expect(parseNaturalAgendaQuery("barcelona").wantsTonight).toBe(false)
  })
})

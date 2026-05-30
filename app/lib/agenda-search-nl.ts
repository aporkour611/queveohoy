export function normalizeAgendaQuery(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s+]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Palabras vacías en preguntas tipo «¿dónde veo el partido del Barça?» */
const STOP_WORDS = new Set([
  "a",
  "al",
  "como",
  "con",
  "cual",
  "de",
  "del",
  "donde",
  "el",
  "en",
  "es",
  "esta",
  "este",
  "estos",
  "estas",
  "hay",
  "hoy",
  "la",
  "las",
  "lo",
  "los",
  "me",
  "mis",
  "mucho",
  "muy",
  "noche",
  "para",
  "partido",
  "partidos",
  "por",
  "puedo",
  "que",
  "se",
  "si",
  "sin",
  "son",
  "su",
  "sus",
  "te",
  "tengo",
  "tonight",
  "tu",
  "tus",
  "un",
  "una",
  "uno",
  "unos",
  "ver",
  "veo",
  "vs",
])

/** Alias frecuentes → términos que aparecen en la agenda */
const TOKEN_ALIASES: Record<string, string[]> = {
  barca: ["barcelona"],
  barsa: ["barcelona"],
  atleti: ["atletico", "atletico madrid"],
  athletico: ["atletico", "atletico madrid"],
  athleti: ["atletico", "atletico madrid"],
  rm: ["real", "madrid"],
  real: ["real", "madrid"],
  psg: ["psg", "paris"],
  city: ["manchester", "city"],
  united: ["manchester", "united"],
  pool: ["liverpool"],
  gunners: ["arsenal"],
  blaugrana: ["barcelona"],
  merengues: ["real", "madrid"],
  ucl: ["champions"],
  champions: ["champions"],
  liga: ["laliga"],
  moto: ["motogp"],
  gp: ["formula1", "motogp"],
  f1: ["formula1"],
  mma: ["ufc"],
}

const PLATFORM_HINTS: Record<string, string> = {
  dazn: "dazn",
  movistar: "movistar",
  netflix: "netflix",
  hbo: "hbo",
  max: "max",
  prime: "prime",
  amazon: "prime",
  gol: "gol",
  teledeporte: "teledeporte",
  la1: "la 1",
  la2: "la 2",
  cuatro: "cuatro",
  antena: "antena",
}

export type ParsedAgendaSearch = {
  /** Texto limpio para búsqueda por tokens (AND) */
  searchText: string
  /** Tokens expandidos con alias; vacío = sin filtro textual */
  tokens: string[]
  /** Plataforma detectada en la pregunta, si la hay */
  platformHint: string | null
  /** La pregunta parece pedir prime time / esta noche */
  wantsTonight: boolean
}

function splitTokens(raw: string): string[] {
  return normalizeAgendaQuery(raw).split(/\s+/).filter(Boolean)
}

function expandToken(token: string): string[] {
  const aliases = TOKEN_ALIASES[token]
  if (aliases?.length) return aliases
  return [token]
}

/**
 * Convierte lenguaje natural en tokens de búsqueda sobre la agenda.
 * Sin LLM: rápido, predecible y sin alucinar horarios.
 */
export function parseNaturalAgendaQuery(raw: string): ParsedAgendaSearch {
  const normalized = normalizeAgendaQuery(raw)
  if (!normalized) {
    return { searchText: "", tokens: [], platformHint: null, wantsTonight: false }
  }

  const wantsTonight = /\b(esta noche|tonight|prime time|prime-time|desde las \d)\b/.test(
    normalized
  )

  let platformHint: string | null = null
  const rawTokens = splitTokens(normalized)
  const kept: string[] = []

  for (const token of rawTokens) {
    const platform = PLATFORM_HINTS[token]
    if (platform) {
      platformHint = platformHint ?? platform
      continue
    }
    if (STOP_WORDS.has(token)) continue
    kept.push(token)
  }

  const expandedTokens = kept.flatMap(expandToken)

  return {
    searchText: expandedTokens.join(" "),
    tokens: expandedTokens,
    platformHint,
    wantsTonight,
  }
}

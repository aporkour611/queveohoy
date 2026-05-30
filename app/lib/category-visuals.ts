/** Colores e identidad visual por categoría (filtros y barras de sección). */

export type CategoryVisualKey =
  | "deportes"
  | "motor"
  | "esports"
  | "cine"
  | "tv"
  | "futbol"
  | "tenis"
  | "basket"
  | "ciclismo"
  | "ufc"
  | "formula1"
  | "motos"
  | "csgo"
  | "valorant"
  | "lol"
  | "series"
  | "anime"
  | "tv-reality"
  | "tv-concurso"
  | "tv-directo"
  | "all"

const GROUP_BY_SPORT: Record<string, CategoryVisualKey> = {
  futbol: "deportes",
  tenis: "deportes",
  basket: "deportes",
  ciclismo: "deportes",
  ufc: "deportes",
  formula1: "motor",
  motos: "motor",
  csgo: "esports",
  valorant: "esports",
  lol: "esports",
  cine: "cine",
  series: "cine",
  anime: "cine",
  tv: "tv",
  "tv-reality": "tv",
  "tv-concurso": "tv",
  "tv-directo": "tv",
}

/** Icono a renderizar para un id de deporte o grupo. */
export function resolveCategoryIconId(id: string): CategoryVisualKey {
  if (id in GROUP_BY_SPORT) return id as CategoryVisualKey
  if (
    id === "deportes" ||
    id === "motor" ||
    id === "esports" ||
    id === "cine" ||
    id === "tv" ||
    id === "all"
  ) {
    return id as CategoryVisualKey
  }
  return "deportes"
}

export function categoryGroupId(sportId: string): CategoryVisualKey {
  return GROUP_BY_SPORT[sportId] ?? "deportes"
}

/** Etiqueta corta del grupo padre (DEPORTES, MOTOR, …). */
export function categoryGroupShortLabel(groupId: string): string {
  switch (groupId) {
    case "deportes":
      return "Deportes"
    case "motor":
      return "Motor"
    case "esports":
      return "E-Sports"
    case "cine":
      return "Cine & series"
    case "tv":
      return "TV y Twitch"
    default:
      return groupId
  }
}

/** Color del trazo del icono (hex). */
export function categoryIconColor(id: string): string {
  switch (resolveCategoryIconId(id)) {
    case "deportes":
    case "futbol":
    case "tenis":
      return "#3aab6e"
    case "basket":
      return "#f97316"
    case "ciclismo":
      return "#eab308"
    case "ufc":
      return "#ef4444"
    case "motor":
    case "formula1":
    case "motos":
    case "csgo":
      return "#f97316"
    case "valorant":
      return "#ff4655"
    case "lol":
      return "#d4a017"
    case "esports":
      return "#a855f7"
    case "cine":
    case "series":
    case "anime":
      return "#c9a227"
    case "tv":
    case "tv-reality":
    case "tv-concurso":
    case "tv-directo":
      return "#d946ef"
    case "all":
      return "#9a9ab0"
    default:
      return "#3aab6e"
  }
}

/** Color de la etiqueta de grupo en chips de filtro. */
export function categoryGroupLabelColor(sportId: string): string {
  const group = categoryGroupId(sportId)
  if (group === "esports" && sportId === "lol") return "#d4a017"
  switch (group) {
    case "deportes":
      return "#3aab6e"
    case "motor":
      return "#f97316"
    case "esports":
      return "#a855f7"
    case "cine":
      return "#c9a227"
    case "tv":
      return "#d946ef"
    default:
      return "#9a9ab0"
  }
}

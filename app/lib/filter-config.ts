import { TV_SPORT_FILTER_IDS } from "./tv-show-category";

export type FilterOption = { id: string; label: string };

export type FilterGroup = {
  id: string;
  label: string;
  options: FilterOption[];
};

export type QuickFilter = {
  id: string;
  label: string;
  sportIds: string[];
};

/** Filtros rápidos visibles — calendario diario con profundización opcional */
export const QUICK_FILTERS: QuickFilter[] = [
  { id: "all", label: "Todo", sportIds: [] },
  {
    id: "deportes",
    label: "Deportes",
    sportIds: ["futbol", "tenis", "basket", "ciclismo", "ufc"],
  },
  { id: "motor", label: "Motor", sportIds: ["formula1", "motos"] },
  { id: "esports", label: "E-Sports", sportIds: ["csgo", "valorant", "lol"] },
  { id: "tv", label: "TV y Twitch", sportIds: [...TV_SPORT_FILTER_IDS] },
  {
    id: "cine",
    label: "Cine, series y anime",
    sportIds: ["cine", "series", "anime"],
  },
];

export const FILTER_GROUPS: FilterGroup[] = [
  {
    id: "deportes",
    label: "Deportes",
    options: [
      { id: "futbol", label: "Fútbol" },
      { id: "tenis", label: "Tenis" },
      { id: "basket", label: "Baloncesto" },
      { id: "ciclismo", label: "Ciclismo" },
      { id: "ufc", label: "UFC" },
    ],
  },
  {
    id: "motor",
    label: "Motor",
    options: [
      { id: "formula1", label: "F1" },
      { id: "motos", label: "Motos" },
    ],
  },
  {
    id: "esports",
    label: "E-Sports",
    options: [
      { id: "csgo", label: "CS2" },
      { id: "valorant", label: "Valorant" },
      { id: "lol", label: "LoL" },
    ],
  },
  {
    id: "cine",
    label: "Cine, series y anime",
    options: [
      { id: "cine", label: "Cine" },
      { id: "series", label: "Series" },
      { id: "anime", label: "Anime" },
    ],
  },
  {
    id: "tv",
    label: "TV y Twitch",
    options: [
      { id: "tv-reality", label: "Reality" },
      { id: "tv-concurso", label: "Concursos" },
      { id: "tv-directo", label: "Directos" },
    ],
  },
];

export const ALL_SPORT_IDS = FILTER_GROUPS.flatMap((g) =>
  g.options.map((o) => o.id)
);

export function sportLabel(sportId: string): string {
  for (const g of FILTER_GROUPS) {
    const opt = g.options.find((o) => o.id === sportId);
    if (opt) return opt.label;
  }
  return sportId;
}

export function sportFilterGroupId(sportId: string): string | null {
  if (sportId === "anime") return "cine";
  for (const g of FILTER_GROUPS) {
    if (g.options.some((o) => o.id === sportId)) return g.id;
  }
  return null;
}

export const STORAGE_KEY = "qvh_sport_filters";

/** Leyenda del hero (nombre + clase de punto de color) */
export const LEGEND_ITEMS = [
  { label: "Deportes", dot: "qvh-dot-purple" },
  { label: "E-Sports", dot: "qvh-dot-green" },
  { label: "Motor", dot: "qvh-dot-motor" },
  { label: "Cine, series y anime", dot: "qvh-dot-gold" },
  { label: "TV y Twitch", dot: "qvh-dot-pink" },
] as const;

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
  { id: "esports", label: "E-Sports", sportIds: ["csgo", "valorant", "lol", "dota2"] },
  { id: "tv", label: "Televisión", sportIds: ["tv"] },
  { id: "cine", label: "Cine y series", sportIds: ["cine", "series"] },
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
    label: "Coches & motos",
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
      { id: "dota2", label: "Dota 2" },
    ],
  },
  {
    id: "cine",
    label: "Cine & series",
    options: [
      { id: "cine", label: "Cine" },
      { id: "series", label: "Series" },
    ],
  },
  {
    id: "tv",
    label: "TV",
    options: [{ id: "tv", label: "Reality, OT y Eurovisión" }],
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
  { label: "Coches & motos", dot: "qvh-dot-motor" },
  { label: "Cine & series", dot: "qvh-dot-gold" },
  { label: "TV", dot: "qvh-dot-pink" },
] as const;

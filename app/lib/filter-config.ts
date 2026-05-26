export type FilterOption = { id: string; label: string };

export type FilterGroup = {
  id: string;
  label: string;
  options: FilterOption[];
};

export const FILTER_GROUPS: FilterGroup[] = [
  {
    id: "deportes",
    label: "Deportes",
    options: [
      { id: "futbol", label: "Fútbol" },
      { id: "tenis", label: "Tenis" },
      { id: "basket", label: "Basket" },
      { id: "ciclismo", label: "Ciclismo" },
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
    options: [{ id: "tv", label: "Reality y estrenos" }],
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
  { label: "Coches & motos", dot: "qvh-dot-blue" },
  { label: "Cine & series", dot: "qvh-dot-gold" },
  { label: "TV", dot: "qvh-dot-pink" },
] as const;

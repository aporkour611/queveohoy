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
      { id: "formula1", label: "F1" },
      { id: "ciclismo", label: "Ciclismo" },
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

export const STORAGE_KEY = "qvh_sport_filters";

/**
 * Configuración visual v10 — grupos principales y subgrupos (mockup aprobado).
 * Los `sportId` deben existir en filter-config / event matching.
 */

export type SubgroupTile = {
  sportId: string;
  label: string;
  iconId?: string;
  disabled?: boolean;
  disabledHint?: string;
};

export type MainCategoryGroupDesign = {
  id: string;
  title: string;
  watermark: string;
  accent: string;
  accentSoft: string;
  sportIds: string[];
  subtitle: string;
  subgroups: SubgroupTile[];
};

export const MAIN_CATEGORY_GROUPS: MainCategoryGroupDesign[] = [
  {
    id: "deportes",
    title: "Deportes",
    watermark: "SPORT",
    accent: "#3aab6e",
    accentSoft: "rgba(58, 171, 110, 0.14)",
    sportIds: ["futbol", "tenis", "basket", "ciclismo", "ufc"],
    subtitle: "Fútbol · Tenis · Baloncesto · Ciclismo · UFC",
    subgroups: [
      { sportId: "futbol", label: "Fútbol" },
      { sportId: "tenis", label: "Tenis" },
      { sportId: "basket", label: "Baloncesto" },
      { sportId: "ciclismo", label: "Ciclismo" },
      { sportId: "ufc", label: "UFC" },
    ],
  },
  {
    id: "motor",
    title: "Motor",
    watermark: "MOTOR",
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.14)",
    sportIds: ["formula1", "motos"],
    subtitle: "F1 · MotoGP · Motos · Rallye",
    subgroups: [
      { sportId: "formula1", label: "F1" },
      { sportId: "motos", label: "MotoGP", iconId: "motos" },
      {
        sportId: "rally",
        label: "Rallye",
        iconId: "motor",
        disabled: true,
        disabledHint: "Próximamente",
      },
    ],
  },
  {
    id: "esports",
    title: "E-Sports",
    watermark: "ESPORTS",
    accent: "#a855f7",
    accentSoft: "rgba(168, 85, 247, 0.14)",
    sportIds: ["csgo", "valorant", "lol"],
    subtitle: "CS2 · Valorant · League of Legends",
    subgroups: [
      { sportId: "csgo", label: "CS2" },
      { sportId: "valorant", label: "Valorant" },
      { sportId: "lol", label: "League of Legends", iconId: "lol" },
    ],
  },
  {
    id: "tv",
    title: "TV y Twitch",
    watermark: "LIVE",
    accent: "#d946ef",
    accentSoft: "rgba(217, 70, 239, 0.14)",
    sportIds: ["tv-reality", "tv-concurso", "tv-directo"],
    subtitle: "Reality · Concursos · Streams · Directos",
    subgroups: [
      { sportId: "tv-reality", label: "Reality", iconId: "tv-reality" },
      { sportId: "tv-concurso", label: "Concursos", iconId: "tv-concurso" },
      { sportId: "tv-directo", label: "Streams", iconId: "tv-directo" },
      {
        sportId: "tv-directo",
        label: "Directos",
        iconId: "tv-directo",
      },
    ],
  },
  {
    id: "cine",
    title: "Cine, series y anime",
    watermark: "CINEMA",
    accent: "#c9a227",
    accentSoft: "rgba(201, 162, 39, 0.14)",
    sportIds: ["cine", "series", "anime"],
    subtitle: "Cine · Series · Anime",
    subgroups: [
      { sportId: "cine", label: "Cine" },
      { sportId: "series", label: "Series" },
      { sportId: "anime", label: "Anime" },
    ],
  },
];

/** Resuelve ids seleccionables (sin disabled / rally). */
export function selectableSportIdsFromGroup(groupId: string): string[] {
  const group = MAIN_CATEGORY_GROUPS.find((g) => g.id === groupId);
  if (!group) return [];
  return group.subgroups.filter((s) => !s.disabled).map((s) => s.sportId);
}

export function isMainGroupFullySelected(
  groupId: string,
  selected: Set<string>
): boolean {
  const ids = selectableSportIdsFromGroup(groupId);
  if (ids.length === 0) return false;
  return ids.every((id) => selected.has(id));
}

export function isMainGroupPartiallySelected(
  groupId: string,
  selected: Set<string>
): boolean {
  const ids = selectableSportIdsFromGroup(groupId);
  const count = ids.filter((id) => selected.has(id)).length;
  return count > 0 && count < ids.length;
}

import type { EventRow } from "../components/types";
import { isEsportsSport } from "./esports";
import {
  isRolandGarrosEvent,
  isRolandGarrosKnockout,
} from "./roland-garros";
import type { SpotlightCoverLayout } from "./spotlight-art";
import recipeData from "./poster-recipes.json";

export type PosterRecipeTier = "flagship" | "sport" | "tv";
export type PosterDuelMode = "tennis" | "ufc";

export type PosterCoverSpec = {
  recipeId: string;
  url: string;
  visualClass: string;
  layout: SpotlightCoverLayout;
  objectPosition?: string;
  duel?: PosterDuelMode;
  tier: PosterRecipeTier;
};

type PosterRecipes = typeof recipeData.recipes;
type PosterRecipeEntry = PosterRecipes[keyof PosterRecipes];

export type PosterMatchRule = {
  id: string;
  recipeId: string | ((event: EventRow, blob: string) => string | null);
  priority: number;
  match: (event: EventRow, blob: string) => boolean;
};

/** Fórmulas visuales compartidas (runtime + scripts/generate-sport-posters.mjs). */
export const POSTER_FORMULAS = recipeData.formulas;

/** Reglas ordenadas por prioridad: la primera que coincida asigna la portada. */
export const POSTER_MATCH_RULES: PosterMatchRule[] = [
  {
    id: "ufc-329",
    recipeId: "ufc-329",
    priority: 100,
    match: (event, blob) =>
      event.sport === "ufc" &&
      (/ufc\s*329|\b329\b/.test(blob) ||
        (/mcgregor/i.test(blob) && /holloway/i.test(blob))),
  },
  {
    id: "mundial",
    recipeId: "mundial",
    priority: 95,
    match: (event, blob) =>
      event.sport === "futbol" &&
      /world cup|mundial\s*2026|fifa world cup|mundial 26/i.test(blob),
  },
  {
    id: "roland-garros-knockout",
    recipeId: "roland-garros-knockout",
    priority: 94,
    match: (event) =>
      event.sport === "tenis" && isRolandGarrosKnockout(event),
  },
  {
    id: "roland-garros",
    recipeId: "roland-garros",
    priority: 93,
    match: (event) => event.sport === "tenis" && isRolandGarrosEvent(event),
  },
  {
    id: "giro-italia",
    recipeId: "giro-italia",
    priority: 90,
    match: (event, blob) =>
      event.sport === "ciclismo" &&
      /giro d.?italia|giro de italia|\bgiro\b/i.test(blob),
  },
  {
    id: "tour-france",
    recipeId: "tour-france",
    priority: 89,
    match: (event, blob) =>
      event.sport === "ciclismo" &&
      /tour de france|tour de francia/i.test(blob),
  },
  {
    id: "vuelta-espana",
    recipeId: "vuelta-espana",
    priority: 88,
    match: (event, blob) =>
      event.sport === "ciclismo" && /vuelta a espa/i.test(blob),
  },
  {
    id: "copa-rey",
    recipeId: "copa-rey",
    priority: 85,
    match: (event, blob) =>
      event.sport === "futbol" && /copa del rey/i.test(blob),
  },
  {
    id: "mobland-s2",
    recipeId: "mobland-s2",
    priority: 85,
    match: (event, blob) =>
      event.sport === "series" && /mobland/i.test(blob),
  },
  {
    id: "ufc-ppv",
    recipeId: "ufc-ppv",
    priority: 80,
    match: (event, blob) => {
      if (event.sport !== "ufc") return false;
      if (/ufc\s*329|\b329\b/.test(blob)) return false;
      return (
        /ufc\s*\d+|kind:ppv|pay.?per.?view|\bppv\b/i.test(blob) ||
        /kind:ppv/i.test(event.source ?? "")
      );
    },
  },
  {
    id: "baloncesto-nba",
    recipeId: "baloncesto-nba",
    priority: 70,
    match: (event, blob) => event.sport === "basket" && /nba/i.test(blob),
  },
  {
    id: "f1",
    recipeId: "f1",
    priority: 60,
    match: (event) => event.sport === "formula1",
  },
  {
    id: "motogp",
    recipeId: "motogp",
    priority: 60,
    match: (event) => event.sport === "motos",
  },
  {
    id: "futbol",
    recipeId: "futbol",
    priority: 50,
    match: (event) => event.sport === "futbol",
  },
  {
    id: "baloncesto",
    recipeId: "baloncesto",
    priority: 50,
    match: (event) => event.sport === "basket",
  },
  {
    id: "tenis",
    recipeId: "tenis",
    priority: 50,
    match: (event) => event.sport === "tenis",
  },
  {
    id: "ciclismo",
    recipeId: "ciclismo",
    priority: 50,
    match: (event) => event.sport === "ciclismo",
  },
  {
    id: "esports",
    recipeId: "esports",
    priority: 45,
    match: (event) => isEsportsSport(event.sport ?? ""),
  },
];

const SPORT_TO_RECIPE: Record<string, string> = {
  futbol: "futbol",
  basket: "baloncesto",
  tenis: "tenis",
  ciclismo: "ciclismo",
  formula1: "f1",
  motos: "motogp",
};

export function eventBlob(event: EventRow): string {
  return `${event.competition ?? ""} ${event.title ?? ""} ${event.source ?? ""}`.toLowerCase();
}

function recipeAssetUrl(recipeId: string, recipe: PosterRecipeEntry): string {
  const assetId =
    "assetId" in recipe && typeof recipe.assetId === "string"
      ? recipe.assetId
      : recipeId;
  return `/${recipe.dir}/${assetId}.png`;
}

export function getPosterRecipe(recipeId: string): PosterRecipeEntry | undefined {
  if (!(recipeId in recipeData.recipes)) return undefined;
  return recipeData.recipes[recipeId as keyof PosterRecipes];
}

export function recipeToCover(recipeId: string): PosterCoverSpec | null {
  const recipe = getPosterRecipe(recipeId);
  if (!recipe) return null;

  const formulaKey =
    "formula" in recipe && typeof recipe.formula === "string"
      ? recipe.formula
      : "spotlightPortrait";
  const formula =
    POSTER_FORMULAS[formulaKey as keyof typeof POSTER_FORMULAS] ??
    POSTER_FORMULAS.spotlightPortrait;

  return {
    recipeId,
    url: recipeAssetUrl(recipeId, recipe),
    visualClass: recipe.visualClass,
    layout: "poster",
    objectPosition:
      ("objectPosition" in recipe ? recipe.objectPosition : undefined) ??
      formula.objectPosition,
    duel:
      "duel" in recipe && (recipe.duel === "tennis" || recipe.duel === "ufc")
        ? recipe.duel
        : undefined,
    tier: recipe.tier as PosterRecipeTier,
  };
}

/** Recetas con tokens SVG para generación de assets (excluye TV sin capas). */
export function listSvgGenerationRecipes(): Array<
  PosterRecipeEntry & { id: string; dir: string }
> {
  return Object.entries(recipeData.recipes)
    .filter(([, recipe]) => "sky" in recipe && "mark" in recipe)
    .map(([id, recipe]) => ({ id, ...recipe }));
}

export function resolvePosterCover(event: EventRow): PosterCoverSpec | null {
  const blob = eventBlob(event);
  const rules = [...POSTER_MATCH_RULES].sort((a, b) => b.priority - a.priority);

  for (const rule of rules) {
    if (!rule.match(event, blob)) continue;

    const recipeId =
      typeof rule.recipeId === "function"
        ? rule.recipeId(event, blob)
        : rule.recipeId;
    if (!recipeId) continue;

    const cover = recipeToCover(recipeId);
    if (cover) return cover;
  }

  return null;
}

/** Portada editorial premium (flagship / TV) — compat con flagship-covers.ts. */
export function resolveFlagshipCover(event: EventRow): PosterCoverSpec | null {
  const cover = resolvePosterCover(event);
  if (!cover) return null;
  if (cover.tier === "flagship" || cover.tier === "tv") return cover;
  return null;
}

export function getRecipeCoverById(recipeId: string): PosterCoverSpec | null {
  return recipeToCover(recipeId);
}

export function getDeportesRecipeCover(sport: string): PosterCoverSpec | null {
  const recipeId = SPORT_TO_RECIPE[sport];
  if (!recipeId) return null;
  return recipeToCover(recipeId);
}

export function isWorldCup2026Event(event: EventRow): boolean {
  if (event.sport !== "futbol") return false;
  return /world cup|mundial\s*2026|fifa world cup|mundial 26/i.test(
    eventBlob(event)
  );
}

export function isGiroItaliaEvent(event: EventRow): boolean {
  if (event.sport !== "ciclismo") return false;
  return /giro d.?italia|giro de italia|\bgiro\b/i.test(eventBlob(event));
}

export function isTourDeFranceEvent(event: EventRow): boolean {
  if (event.sport !== "ciclismo") return false;
  return /tour de france|tour de francia/i.test(eventBlob(event));
}

export function isVueltaEspanaEvent(event: EventRow): boolean {
  if (event.sport !== "ciclismo") return false;
  return /vuelta a espa/i.test(eventBlob(event));
}

export function isUfc329McGregorEvent(event: EventRow): boolean {
  if (event.sport !== "ufc") return false;
  const blob = eventBlob(event);
  return (
    /ufc\s*329|\b329\b/.test(blob) ||
    (/mcgregor/i.test(blob) && /holloway/i.test(blob))
  );
}

export function isUfcPpvEvent(event: EventRow): boolean {
  if (event.sport !== "ufc") return false;
  if (isUfc329McGregorEvent(event)) return false;
  const blob = eventBlob(event);
  return (
    /ufc\s*\d+|kind:ppv|pay.?per.?view|\bppv\b/i.test(blob) ||
    /kind:ppv/i.test(event.source ?? "")
  );
}

export function isMobLandSeriesEvent(event: EventRow): boolean {
  if (event.sport !== "series") return false;
  return /mobland/i.test(eventBlob(event));
}

export function isNbaEvent(event: EventRow): boolean {
  if (event.sport !== "basket") return false;
  return /nba/i.test(eventBlob(event));
}

export function isCopaDelReyEvent(event: EventRow): boolean {
  if (event.sport !== "futbol") return false;
  return /copa del rey/i.test(eventBlob(event));
}

export type FlagshipCoverSpec = Omit<PosterCoverSpec, "recipeId" | "tier" | "duel">;

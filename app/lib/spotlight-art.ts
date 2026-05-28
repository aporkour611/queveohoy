import {
  getDeportesRecipeCover,
  getRecipeCoverById,
} from "./poster-recipes";

export type SpotlightCoverLayout = "poster" | "emblem" | "emblem-duel";

export type SpotlightCover = {
  url: string;
  local: boolean;
  layout: SpotlightCoverLayout;
  objectPosition?: string;
};

const ESPORTS_GAME_ART: Record<
  string,
  { url: string; visualClass: string; label: string }
> = {
  csgo: {
    url: "/esports/cs2.png",
    visualClass: "qvh-spotlight-visual-cs2",
    label: "CS2",
  },
  valorant: {
    url: "/esports/valorant.png",
    visualClass: "qvh-spotlight-visual-valorant",
    label: "Valorant",
  },
  lol: {
    url: "/esports/lol.png",
    visualClass: "qvh-spotlight-visual-lol",
    label: "LoL",
  },
};

const ESPORTS_GENERIC = {
  url: "/esports/esports.png",
  visualClass: "qvh-spotlight-visual-esports",
  label: "E-Sports",
};

export function getEsportsGameArt(sport: string) {
  return ESPORTS_GAME_ART[sport] ?? ESPORTS_GENERIC;
}

export function getMotorArt(sport: string) {
  const recipeId = sport === "motos" ? "motogp" : "f1";
  const cover = getRecipeCoverById(recipeId);
  return {
    url: cover?.url ?? `/motor/${recipeId === "motogp" ? "motogp" : "f1"}.png`,
    visualClass:
      cover?.visualClass ??
      (recipeId === "motogp"
        ? "qvh-spotlight-visual-motogp"
        : "qvh-spotlight-visual-f1"),
  };
}

export function getDeportesArt(sport: string) {
  const cover = getDeportesRecipeCover(sport);
  if (!cover) return undefined;
  return { url: cover.url, visualClass: cover.visualClass };
}

export function getNbaArt() {
  const cover = getRecipeCoverById("baloncesto-nba");
  return {
    url: cover?.url ?? "/deportes/baloncesto-nba.png",
    visualClass: cover?.visualClass ?? "qvh-spotlight-visual-basket-nba",
  };
}

export function localSpotlightCover(
  url: string,
  layout: SpotlightCoverLayout,
  objectPosition?: string
): SpotlightCover {
  return { url, local: true, layout, objectPosition };
}

export function remoteSpotlightCover(
  url: string,
  layout: SpotlightCoverLayout = "poster",
  objectPosition?: string
): SpotlightCover {
  return { url, local: false, layout, objectPosition };
}

const MEDIA_FALLBACK: Record<string, string> = {
  cine: "/fallback/cine.svg",
  series: "/fallback/series.svg",
  tv: "/fallback/tv.svg",
};

export function mediaFallbackCover(sport: string): SpotlightCover | undefined {
  const url = MEDIA_FALLBACK[sport];
  if (!url) return undefined;
  return localSpotlightCover(url, "emblem");
}

export function hasSpotlightPosterCover(cover: SpotlightCover): boolean {
  return cover.layout === "poster";
}

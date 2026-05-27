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
    url: "/esports/cs2.svg",
    visualClass: "qvh-spotlight-visual-cs2",
    label: "CS2",
  },
  valorant: {
    url: "/esports/valorant.svg",
    visualClass: "qvh-spotlight-visual-valorant",
    label: "Valorant",
  },
  lol: {
    url: "/esports/lol.svg",
    visualClass: "qvh-spotlight-visual-lol",
    label: "LoL",
  },
};

const MOTOR_ART: Record<string, { url: string; visualClass: string }> = {
  formula1: {
    url: "/motor/f1.svg",
    visualClass: "qvh-spotlight-visual-f1",
  },
  motos: {
    url: "/motor/motogp.svg",
    visualClass: "qvh-spotlight-visual-motogp",
  },
};

const MEDIA_FALLBACK: Record<string, string> = {
  cine: "/fallback/cine.svg",
  series: "/fallback/series.svg",
  tv: "/fallback/tv.svg",
  basket: "/fallback/deportes.svg",
  tenis: "/fallback/deportes.svg",
  ciclismo: "/fallback/deportes.svg",
};

export function getEsportsGameArt(sport: string) {
  return ESPORTS_GAME_ART[sport] ?? ESPORTS_GAME_ART.csgo;
}

export function getMotorArt(sport: string) {
  return MOTOR_ART[sport] ?? MOTOR_ART.formula1;
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

export function mediaFallbackCover(sport: string): SpotlightCover | undefined {
  const url = MEDIA_FALLBACK[sport];
  if (!url) return undefined;
  return localSpotlightCover(url, "emblem");
}

export function hasSpotlightPosterCover(cover: SpotlightCover): boolean {
  return cover.layout === "poster";
}

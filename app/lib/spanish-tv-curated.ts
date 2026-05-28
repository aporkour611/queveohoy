import type { EventRow } from "../components/types";
import tvTmdbPosters from "./spanish-tv-tmdb-posters.json";

export type SpanishTvManualSlot = {
  /** YYYY-MM-DD en Europe/Madrid */
  date: string;
  time?: string;
  title?: string;
  edition?: string;
};

export type SpanishTvShow = {
  id: string;
  search: string;
  patterns: RegExp[];
  competition: string;
  platform: string;
  priority: number;
  category: "reality" | "concurso" | "directo" | "ficcion";
  /** ID TMDB fijo (evita confundir con versiones extranjeras). */
  tmdbId?: number;
  /** ID TVmaze para parrilla lineal España. */
  tvmazeShowId?: number;
  /** ID programa RTVE (api.rtve.es). */
  rtveProgramId?: number;
  /** Poster TMDB (/path) para tarjetas si aún no hay fila en BD. */
  posterPath?: string | null;
  /** Póster editorial en /public (p. ej. /posters/mask-singer.png). */
  localPosterPath?: string;
  /** object-position CSS para recortar el encuadre del póster. */
  posterObjectPosition?: string;
  /** Hora habitual de emisión en península (HH:MM). */
  airTime?: string;
  /** Días de emisión recurrentes: 1 = lunes … 7 = domingo (ISO). */
  airWeekdays?: number[];
  /** Fechas puntuales en España por episodio (anula TMDB). */
  episodeSpainDates?: Array<{
    season: number;
    episode: number;
    date: string;
  }>;
  /** Fechas fijas cuando no hay TMDB (eventos puntuales). */
  manualSlots?: SpanishTvManualSlot[];
};

type TmdbPosterMeta = {
  tmdbId: number;
  posterPath: string | null;
};

function applyTmdbPosterMeta(show: SpanishTvShow): SpanishTvShow {
  const meta = (tvTmdbPosters as Record<string, TmdbPosterMeta>)[show.id];
  if (!meta?.posterPath) {
    return show.tmdbId ? show : { ...show, tmdbId: meta?.tmdbId ?? show.tmdbId };
  }

  return {
    ...show,
    tmdbId: meta.tmdbId ?? show.tmdbId,
    posterPath: meta.posterPath,
  };
}

/** Programas de máxima audiencia en España — prioridad editorial y cron TMDB/TVmaze/RTVE */
const SPANISH_TV_FLAGSHIP_RAW: SpanishTvShow[] = [
  {
    id: "eurovision",
    search: "Eurovisión",
    patterns: [/eurovisi[oó]n|eurovision song contest/i],
    competition: "Concurso · Eurovisión",
    platform: "RTVE · RTVE Play · PepeTV",
    priority: 98,
    category: "concurso",
    localPosterPath: "/posters/eurovision.png",
  },
  {
    id: "el-hormiguero",
    search: "El Hormiguero",
    patterns: [/el hormiguero|hormiguero 3\.0/i],
    competition: "Talk show · El Hormiguero",
    platform: "Antena 3 · ATRESPLAYER TV",
    priority: 99,
    category: "directo",
    localPosterPath: "/posters/el-hormiguero.png",
    airTime: "22:00",
    airWeekdays: [1, 2, 3, 4, 5],
  },
  {
    id: "pasapalabra",
    search: "Pasapalabra",
    patterns: [/pasapalabra/i],
    competition: "Concurso · Pasapalabra",
    platform: "Antena 3 · ATRESPLAYER TV",
    priority: 98,
    category: "concurso",
    localPosterPath: "/posters/pasapalabra.png",
    airTime: "17:00",
    airWeekdays: [1, 2, 3, 4, 5],
  },
  {
    id: "tu-cara-me-suena",
    search: "Tu cara me suena",
    patterns: [/tu cara me suena/i],
    competition: "Concurso · Tu cara me suena",
    platform: "Antena 3 · ATRESPLAYER TV",
    priority: 96,
    category: "concurso",
    localPosterPath: "/posters/tu-cara-me-suena.png",
    tvmazeShowId: 54412,
    airTime: "22:00",
    airWeekdays: [5],
  },
  {
    id: "la-ruleta",
    search: "La ruleta de la suerte",
    patterns: [/la ruleta de la suerte|ruleta de la suerte/i],
    competition: "Concurso · La ruleta de la suerte",
    platform: "Antena 3 · ATRESPLAYER TV",
    priority: 92,
    category: "concurso",
    localPosterPath: "/posters/la-ruleta.png",
    airTime: "15:00",
    airWeekdays: [1, 2, 3, 4, 5],
  },
  {
    id: "la-revuelta",
    search: "La Revuelta",
    patterns: [/la revuelta/i],
    competition: "Talk show · La Revuelta",
    platform: "La 1 · RTVE Play",
    priority: 97,
    category: "directo",
    localPosterPath: "/posters/la-revuelta.png",
    tvmazeShowId: 79483,
    airTime: "21:40",
    airWeekdays: [1, 2, 3, 4],
  },
  {
    id: "suenos-libertad",
    search: "Sueños de libertad",
    patterns: [/sue[nñ]os de libertad/i],
    competition: "Ficción · Sueños de libertad",
    platform: "Antena 3 · ATRESPLAYER TV",
    priority: 97,
    category: "ficcion",
    localPosterPath: "/posters/suenos-libertad.png",
    tvmazeShowId: 74973,
    airTime: "15:45",
    airWeekdays: [1, 2, 3, 4, 5],
  },
  {
    id: "la-promesa",
    search: "La promesa",
    patterns: [/la promesa/i],
    competition: "Ficción · La promesa",
    platform: "La 1 · RTVE Play",
    priority: 95,
    category: "ficcion",
    localPosterPath: "/posters/la-promesa.png",
    tvmazeShowId: 82594,
    airTime: "18:35",
    airWeekdays: [1, 2, 3, 4, 5],
  },
  {
    id: "late-xou",
    search: "Late Xou",
    patterns: [/late xou|late xou con marc gir[oó]/i],
    competition: "Talk show · Late Xou",
    platform: "La 2 · RTVE Play",
    priority: 88,
    category: "directo",
    localPosterPath: "/posters/late-xou.png",
    airTime: "00:05",
    airWeekdays: [1, 2, 3, 4, 5],
  },
  {
    id: "isla-tentaciones",
    tmdbId: 95676,
    search: "La Isla de las Tentaciones",
    patterns: [/isla de las tentaciones|temptation island/i],
    competition: "Reality · La Isla de las Tentaciones",
    platform: "Telecinco · Mitele",
    priority: 98,
    category: "reality",
    localPosterPath: "/posters/isla-tentaciones.png",
    airTime: "23:00",
    airWeekdays: [1, 2],
    episodeSpainDates: [
      { season: 10, episode: 24, date: "2026-06-01" },
      { season: 10, episode: 25, date: "2026-06-02" },
    ],
  },
  {
    id: "velada-ibai",
    search: "La Velada del Año",
    patterns: [/velada del a[nñ]o|la velada\b/i],
    competition: "Directo · La Velada del Año",
    platform: "Twitch · Ibai",
    priority: 99,
    category: "directo",
    localPosterPath: "/posters/velada-ibai.png",
    airTime: "19:30",
    manualSlots: [
      {
        date: "2026-07-25",
        time: "19:30",
        edition: "VI",
        title: "La Velada del Año VI",
      },
    ],
  },
  {
    id: "masterchef",
    tmdbId: 49982,
    search: "MasterChef España",
    patterns: [/master\s*chef/i],
    competition: "Concurso · MasterChef",
    platform: "La 1 · RTVE Play",
    priority: 94,
    category: "concurso",
    localPosterPath: "/posters/masterchef.png",
    airTime: "22:50",
    airWeekdays: [1],
  },
  {
    id: "operacion-triunfo",
    search: "Operación Triunfo",
    patterns: [/operaci[oó]n triunfo/i],
    competition: "Concurso · Operación Triunfo",
    platform: "RTVE · RTVE Play",
    priority: 95,
    category: "concurso",
    tvmazeShowId: 33788,
    localPosterPath: "/posters/operacion-triunfo.png",
  },
  {
    id: "gran-hermano",
    search: "Gran Hermano",
    patterns: [/gran hermano/i],
    competition: "Reality · Gran Hermano",
    platform: "Telecinco · Mitele",
    priority: 90,
    category: "reality",
    localPosterPath: "/posters/gran-hermano.png",
  },
  {
    id: "supervivientes",
    search: "Supervivientes",
    patterns: [/supervivientes|survivor/i],
    competition: "Reality · Supervivientes",
    platform: "Telecinco · Mitele",
    priority: 88,
    category: "reality",
    localPosterPath: "/posters/supervivientes.png",
  },
  {
    id: "mask-singer",
    search: "Mask Singer",
    patterns: [/mask singer|the masked singer/i],
    competition: "Concurso · Mask Singer",
    platform: "Antena 3 · ATRESPLAYER TV",
    priority: 85,
    category: "concurso",
    localPosterPath: "/posters/mask-singer.png",
    posterObjectPosition: "center 32%",
    airTime: "23:00",
    airWeekdays: [3],
  },
];

export const SPANISH_TV_FLAGSHIP: SpanishTvShow[] =
  SPANISH_TV_FLAGSHIP_RAW.map(applyTmdbPosterMeta);

export const SPANISH_TV_TITLE_PATTERNS = SPANISH_TV_FLAGSHIP.flatMap(
  (show) => show.patterns
);

function normalizeShowName(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function matchSpanishTvByTvmazeShow(
  tvmazeShowId: number
): SpanishTvShow | null {
  return (
    SPANISH_TV_FLAGSHIP.find((show) => show.tvmazeShowId === tvmazeShowId) ??
    null
  );
}

export function matchSpanishTvShowName(name?: string | null): SpanishTvShow | null {
  const normalized = normalizeShowName(name);
  if (!normalized) return null;

  for (const show of SPANISH_TV_FLAGSHIP) {
    if (normalizeShowName(show.search) === normalized) return show;
    if (show.patterns.some((pattern) => pattern.test(name ?? ""))) return show;
  }
  return null;
}

export function matchSpanishTvByRtveProgramId(
  rtveProgramId: number
): SpanishTvShow | null {
  return (
    SPANISH_TV_FLAGSHIP.find((show) => show.rtveProgramId === rtveProgramId) ??
    null
  );
}

export function listSpanishTvWithRtveProgramId(): SpanishTvShow[] {
  return SPANISH_TV_FLAGSHIP.filter((show) => show.rtveProgramId);
}

export function matchesSpanishTvFlagship(event: {
  title?: string | null;
  competition?: string | null;
  sport?: string | null;
}): SpanishTvShow | null {
  if (event.sport !== "tv" && event.sport !== "series") return null;
  const blob = `${event.title ?? ""} ${event.competition ?? ""}`;
  for (const show of SPANISH_TV_FLAGSHIP) {
    if (show.patterns.some((pattern) => pattern.test(blob))) return show;
  }
  return null;
}

export function spanishTvPriorityBonus(event: EventRow): number {
  return matchesSpanishTvFlagship(event)?.priority ?? 0;
}

export function isSpanishTvFlagship(event: EventRow): boolean {
  return spanishTvPriorityBonus(event) > 0;
}

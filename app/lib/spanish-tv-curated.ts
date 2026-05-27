import type { EventRow } from "../components/types";

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
  category: "reality" | "concurso" | "directo";
  /** ID TMDB fijo (evita confundir con versiones extranjeras). */
  tmdbId?: number;
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
  /** Fechas fijas cuando no hay TMDB (eventos puntuales). */
  manualSlots?: SpanishTvManualSlot[];
};

/** Programas de máxima audiencia en España — prioridad editorial y cron TMDB */
export const SPANISH_TV_FLAGSHIP: SpanishTvShow[] = [
  {
    id: "eurovision",
    search: "Eurovisión",
    patterns: [/eurovisi[oó]n|eurovision song contest/i],
    competition: "Concurso · Eurovisión",
    platform: "RTVE · RTVE Play · PepeTV",
    priority: 98,
    category: "concurso",
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
    posterPath: "/5UNSRQc1ZCVmkDxi9llNqrUudYt.jpg",
    airTime: "23:00",
    airWeekdays: [1, 2],
  },
  {
    id: "velada-ibai",
    search: "La Velada del Año",
    patterns: [/velada del a[nñ]o|la velada\b/i],
    competition: "Directo · La Velada del Año",
    platform: "Twitch · Ibai",
    priority: 99,
    category: "directo",
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
    posterPath: "/9p3sgMqNulDMsHbk2ZdOsWoJqTq.jpg",
    airTime: "22:50",
    airWeekdays: [1],
  },
  {
    id: "operacion-triunfo",
    search: "Operación Triunfo",
    patterns: [/operaci[oó]n triunfo|\bOT\b/i],
    competition: "Concurso · Operación Triunfo",
    platform: "RTVE · RTVE Play",
    priority: 95,
    category: "concurso",
  },
  {
    id: "gran-hermano",
    search: "Gran Hermano",
    patterns: [/gran hermano/i],
    competition: "Reality · Gran Hermano",
    platform: "Telecinco · Mitele",
    priority: 90,
    category: "reality",
  },
  {
    id: "supervivientes",
    search: "Supervivientes",
    patterns: [/supervivientes|survivor/i],
    competition: "Reality · Supervivientes",
    platform: "Telecinco · Mitele",
    priority: 88,
    category: "reality",
  },
  {
    id: "mask-singer",
    search: "Mask Singer",
    patterns: [/mask singer|the masked singer/i],
    competition: "Concurso · Mask Singer",
    platform: "Antena 3 · Atresplayer",
    priority: 85,
    category: "concurso",
    localPosterPath: "/posters/mask-singer.png",
    posterObjectPosition: "center 32%",
    airTime: "23:00",
    airWeekdays: [3],
  },
];

export const SPANISH_TV_TITLE_PATTERNS = SPANISH_TV_FLAGSHIP.flatMap(
  (show) => show.patterns
);

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

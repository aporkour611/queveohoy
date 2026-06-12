/** Episodios editoriales visibles en Destacados (ventana semanal). */
export type CuratedSeriesEpisode = {
  tmdbId: number;
  title: string;
  patterns: RegExp[];
  season: number;
  episode: number;
  episodeName?: string;
  /** Fecha de estreno en España (Europe/Madrid), YYYY-MM-DD — no la air_date US de TMDB. */
  airDate: string;
  /** Hora en península (HH:MM). Streaming US → suele ser madrugada del lunes. */
  airTime?: string;
  platform: string;
  competition?: string;
  posterPath?: string;
  priority: number;
};

/** TMDB IDs sin fecha de estreno confirmada en España — no importar del cron. */
export const BLOCKED_SERIES_TMDB_IDS = new Set([250307]); // MobLand T2

/** Series con calendario distinto al de TMDB/US — el cron no corrige la fecha sola. */
export const CURATED_SERIES_EPISODES: CuratedSeriesEpisode[] = [
  {
    tmdbId: 124364,
    title: "FROM",
    patterns: [/^from\b/i],
    season: 4,
    episode: 6,
    episodeName: "The Heart Is a Lonely Hunter",
    airDate: "2026-06-01",
    airTime: "03:00",
    platform: "HBO Max",
    competition: "Nuevo episodio",
    posterPath: "/pRtJagIxpfODzzb0T0NAvZSzErC.jpg",
    priority: 96,
  },
  {
    tmdbId: 85552,
    title: "Euphoria",
    patterns: [/^euphoria\b/i],
    season: 3,
    episode: 8,
    episodeName: "Episodio 8",
    airDate: "2026-06-01",
    airTime: "03:00",
    platform: "HBO Max",
    competition: "Final de temporada · Nuevo episodio",
    posterPath: "/6Sdm5XwdCnspdEF8fTFx6UJrl7o.jpg",
    priority: 96,
  },
];

export function curatedSeriesByExternalId(
  externalId?: string | null
): CuratedSeriesEpisode | undefined {
  if (!externalId) return undefined;
  return CURATED_SERIES_EPISODES.find(
    (episode) =>
      externalId ===
      `tmdb_tv_${episode.tmdbId}_${episode.airDate}_s${episode.season}e${episode.episode}`
  );
}

export function curatedSeriesPriorityForEvent(
  event: { title?: string | null; external_id?: string | null; sport?: string | null }
): number | null {
  if (event.sport !== "series") return null;

  const byId = curatedSeriesByExternalId(event.external_id);
  if (byId) return byId.priority;

  const showTitle = (event.title ?? "").split(" — ")[0]?.trim() ?? "";
  const match = CURATED_SERIES_EPISODES.find((episode) =>
    episode.patterns.some((pattern) => pattern.test(showTitle))
  );
  return match?.priority ?? null;
}

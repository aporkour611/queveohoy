/** Episodios editoriales visibles en Destacados (ventana semanal). */
export type CuratedSeriesEpisode = {
  tmdbId: number;
  title: string;
  patterns: RegExp[];
  season: number;
  episode: number;
  episodeName?: string;
  airDate: string;
  airTime?: string;
  platform: string;
  competition?: string;
  posterPath?: string;
  priority: number;
};

export const CURATED_SERIES_EPISODES: CuratedSeriesEpisode[] = [
  {
    tmdbId: 124364,
    title: "FROM",
    patterns: [/^from\b/i],
    season: 4,
    episode: 6,
    airDate: "2026-05-31",
    airTime: "22:00",
    platform: "Prime Video",
    competition: "Nuevo episodio",
    posterPath: "/pRtJagIxpfODzzb0T0NAvZSzErC.jpg",
    priority: 95,
  },
  {
    tmdbId: 85552,
    title: "Euphoria",
    patterns: [/^euphoria\b/i],
    season: 3,
    episode: 8,
    episodeName: "Episodio 8",
    airDate: "2026-05-31",
    airTime: "23:00",
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

export function matchesCuratedSeries(event: {
  title?: string | null;
  sport?: string | null;
}): CuratedSeriesEpisode | undefined {
  if (event.sport !== "series") return undefined;
  const showTitle = (event.title ?? "").split(" — ")[0]?.trim() ?? "";
  return CURATED_SERIES_EPISODES.find((episode) =>
    episode.patterns.some((pattern) => pattern.test(showTitle))
  );
}

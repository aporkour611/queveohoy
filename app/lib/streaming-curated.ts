/** Series y películas de máxima audiencia en España — el cron las vigila siempre. */
export type StreamingPriorityShow = {
  tmdbId: number;
  title: string;
  platform: string;
  priority: number;
};

export const STREAMING_PRIORITY_SHOWS: StreamingPriorityShow[] = [
  { tmdbId: 66732, title: "Stranger Things", platform: "Netflix", priority: 99 },
  { tmdbId: 91239, title: "Los Bridgerton", platform: "Netflix", priority: 97 },
  { tmdbId: 119051, title: "Merlina", platform: "Netflix", priority: 96 },
  { tmdbId: 259024, title: "Aquí no hay quien viva", platform: "Netflix", priority: 98 },
  { tmdbId: 210879, title: "Machos Alfa", platform: "Netflix", priority: 94 },
  { tmdbId: 67006, title: "La que se avecina", platform: "Prime Video", priority: 93 },
  { tmdbId: 93405, title: "El juego del calamar", platform: "Netflix", priority: 90 },
  { tmdbId: 124364, title: "FROM", platform: "HBO Max", priority: 95 },
  { tmdbId: 85552, title: "Euphoria", platform: "HBO Max", priority: 96 },
  { tmdbId: 250307, title: "MobLand", platform: "Paramount+", priority: 88 },
];

export const STREAMING_PRIORITY_TMDB_IDS = STREAMING_PRIORITY_SHOWS.map(
  (show) => show.tmdbId
);

export function streamingShowByTmdbId(
  tmdbId: number
): StreamingPriorityShow | undefined {
  return STREAMING_PRIORITY_SHOWS.find((show) => show.tmdbId === tmdbId);
}

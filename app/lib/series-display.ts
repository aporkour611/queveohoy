import type { EventRow } from "../components/types";
import { parseTmdbEpisodeMeta } from "./tmdb-client";

function isRedundantEpisodeName(
  episode: number,
  episodeName?: string | null
): boolean {
  if (!episodeName) return false;
  const normalized = episodeName.trim().toLowerCase();
  return (
    new RegExp(`^episodio\\s*${episode}\\b`, "i").test(normalized) ||
    new RegExp(`^episode\\s*${episode}\\b`, "i").test(normalized) ||
    normalized === String(episode) ||
    normalized === `ep ${episode}`
  );
}

export function formatSeriesEpisodeTitle(
  showName: string,
  season: number,
  episode: number,
  episodeName?: string | null
): string {
  const epLabel = season && episode ? `T${season}E${episode}` : null;
  const epName = episodeName?.trim();
  const cleanName =
    epName && !isRedundantEpisodeName(episode, epName) ? epName : null;

  if (epLabel && cleanName) return `${showName} — ${epLabel}: ${cleanName}`;
  if (epLabel) return `${showName} — ${epLabel}`;
  return showName;
}

/** Limpia títulos ya guardados con "T4E6: Episodio 6". */
export function displaySeriesTitle(event: EventRow): string {
  const title = event.title?.trim();
  if (!title || event.sport !== "series") return title || "Sin título";

  const meta = parseTmdbEpisodeMeta(event.external_id);
  if (!meta) return title;

  const parts = title.split(" — ");
  const showName = parts[0]?.trim() || title;
  const tail = parts.slice(1).join(" — ");
  const epMatch = tail.match(/^T(\d+)E(\d+)(?::\s*(.+))?$/i);
  if (!epMatch) return title;

  return formatSeriesEpisodeTitle(
    showName,
    meta.season,
    meta.episode,
    epMatch[3]
  );
}

export function displaySeriesSubtitle(event: EventRow): string | null {
  if (event.sport !== "series") return null;

  const competition = event.competition?.trim();
  if (competition) return competition;

  const meta = parseTmdbEpisodeMeta(event.external_id);
  if (!meta) return null;

  return `T${meta.season} · E${meta.episode}`;
}

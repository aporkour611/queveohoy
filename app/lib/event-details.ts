import type { EventRow } from "../components/types";
import { resolveChannelsForEvent } from "./channels";
import { sportLabel } from "./filter-config";
import { footballSpotlightMeta } from "./football";
import { parseJikanBuzzScore } from "./jikan-client";
import { parseTmdbBuzzScore, parseTmdbEpisodeMeta } from "./tmdb-client";
import { parseUfcKindFromSource, ufcKindLabel } from "./thesportsdb-ufc-client";

export type EventDetail = {
  label: string;
  value: string;
};

function footballPhase(competition?: string | null): string | null {
  const raw = competition?.trim();
  if (!raw) return null;

  const [, ...stageParts] = raw.split(" · ").map((s) => s.trim()).filter(Boolean);
  if (stageParts.length) return stageParts.join(" · ");

  const base = raw.toLowerCase();
  if (/primera|laliga|liga española|premier|bundesliga|serie a|ligue 1|ligue1/i.test(base)) {
    return "Liga regular";
  }
  if (/champions|europa|conference|libertadores|sudamericana/i.test(base)) {
    return "Fase de grupos o liga";
  }
  return null;
}

function esportsFormat(competition?: string | null): string | null {
  const blob = (competition ?? "").toLowerCase();
  if (/worlds|msi|major|iem|blast|vct|champions tour|lec|lck|lpl|lcs|pgl/i.test(blob)) {
    return "Eliminatoria oficial de alto nivel";
  }
  if (/regular|split|season|league/i.test(blob)) return "Liga regular";
  return null;
}

function tmdbInterestLabel(source?: string | null): string | null {
  const buzz = parseTmdbBuzzScore(source);
  if (buzz <= 0) return null;
  if (buzz >= 200) return "Muy buscado esta semana";
  if (buzz >= 140) return "Tendencia en TMDB";
  return "Interés moderado en TMDB";
}

function mediaInterestLabel(source?: string | null): string | null {
  const tmdb = tmdbInterestLabel(source);
  if (tmdb) return tmdb;
  const jikanBuzz = parseJikanBuzzScore(source);
  if (jikanBuzz <= 0) return null;
  if (jikanBuzz >= 50) return "Muy popular en MyAnimeList";
  if (jikanBuzz >= 35) return "Tendencia en anime";
  return "En emisión esta semana";
}

function pushDetail(
  rows: EventDetail[],
  label: string,
  value?: string | null
) {
  const trimmed = value?.trim();
  if (trimmed) rows.push({ label, value: trimmed });
}

export function buildEventDetails(event: EventRow): EventDetail[] {
  const rows: EventDetail[] = [];
  const sport = event.sport ?? "";
  const channels = resolveChannelsForEvent(event).join(" · ");

  if (sport === "futbol") {
    pushDetail(rows, "Fase", footballPhase(event.competition));
    pushDetail(rows, "Contexto", footballSpotlightMeta(event.competition));
    pushDetail(rows, "Partido", event.title);
    pushDetail(rows, "Dónde ver", channels || event.platform);
    return rows;
  }

  if (sport === "ufc") {
    const kind = parseUfcKindFromSource(event.source);
    const eventName = event.title?.trim() || "UFC";
    const cardLine = event.competition?.trim();
    pushDetail(rows, "Evento", eventName);
    pushDetail(
      rows,
      "Cartelera",
      cardLine && cardLine !== ufcKindLabel(kind) ? cardLine : null
    );
    pushDetail(rows, "Tipo de evento", ufcKindLabel(kind));
    pushDetail(
      rows,
      "Emisión",
      kind === "ppv" ? "DAZN PPV (suscripción)" : "DAZN / UFC Fight Pass"
    );
    pushDetail(rows, "Sede", event.platform);
    return rows;
  }

  if (sport === "formula1") {
    const isQualy = /clasificaci[oó]n/i.test(event.title ?? "");
    pushDetail(rows, "Sesión", isQualy ? "Clasificación" : "Carrera");
    pushDetail(rows, "Gran Premio", event.title?.replace(/^F1\s+(Clasificación\s+—\s+)?/i, ""));
    pushDetail(rows, "Campeonato", event.competition || "Fórmula 1");
    pushDetail(rows, "Emisión", channels || event.platform || "DAZN F1");
    return rows;
  }

  if (sport === "csgo" || sport === "valorant" || sport === "lol") {
    pushDetail(rows, "Torneo", event.competition);
    pushDetail(rows, "Partido", event.title);
    pushDetail(rows, "Formato", esportsFormat(event.competition));
    pushDetail(rows, "Plataforma", channels || event.platform || "Twitch");
    return rows;
  }

  if (sport === "cine" || sport === "series" || sport === "anime") {
    pushDetail(rows, "Título", event.title);
    pushDetail(rows, "Tipo", event.competition);
    if (sport === "series") {
      const meta = parseTmdbEpisodeMeta(event.external_id);
      if (meta) {
        pushDetail(
          rows,
          "Episodio",
          `T${meta.season} · E${meta.episode}`
        );
      }
    }
    pushDetail(rows, "Dónde ver", event.platform);
    pushDetail(rows, "Interés", mediaInterestLabel(event.source));
    return rows;
  }

  if (sport === "tv") {
    pushDetail(rows, "Programa", event.title);
    pushDetail(rows, "Formato", event.competition);
    pushDetail(rows, "Interés", tmdbInterestLabel(event.source));
    pushDetail(rows, "Emisión", channels || event.platform);
    return rows;
  }

  pushDetail(rows, "Evento", event.title);
  pushDetail(rows, "Competición", event.competition);
  pushDetail(rows, "Deporte", sportLabel(sport));
  pushDetail(rows, "Dónde ver", channels || event.platform);
  return rows;
}

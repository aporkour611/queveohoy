import type { EventRow } from "../components/types";
import { parseChannels } from "./channels";
import { sportLabel } from "./filter-config";
import { footballSpotlightMeta, shortTeamName } from "./football";
import { parseTmdbBuzzScore, parseTmdbEpisodeMeta } from "./tmdb";
import { parseUfcKindFromSource, ufcKindLabel } from "./thesportsdb-ufc";

export type EventDetail = {
  label: string;
  value: string;
};

const TEAM_BETTING_TIER: { pattern: RegExp; score: number }[] = [
  {
    pattern:
      /real madrid|manchester city|bayern|psg|paris saint|liverpool|barcelona|arsenal|inter milan|juventus|chelsea|dortmund|bayer leverkusen/i,
    score: 92,
  },
  {
    pattern:
      /manchester united|tottenham|napoli|roma|benfica|porto|ajax|atl[eé]tico madrid|sevilla|villarreal|newcastle|ac milan|monaco|lyon|marseille|atalanta|lazio|sporting cp|celtic|rangers/i,
    score: 78,
  },
  {
    pattern:
      /real sociedad|athletic|betis|valencia|fiorentina|frankfurt|leipzig|lille|nice|rennes|west ham|aston villa|brighton|wolves|everton|brentford|fulham/i,
    score: 65,
  },
];

function teamBettingScore(name: string): number {
  const n = name.toLowerCase();
  for (const { pattern, score } of TEAM_BETTING_TIER) {
    if (pattern.test(n)) return score;
  }
  return 50;
}

function bettingFavoriteHint(
  home?: string | null,
  away?: string | null
): string | null {
  if (!home?.trim() || !away?.trim()) return null;

  const homeScore = teamBettingScore(home) + 3;
  const awayScore = teamBettingScore(away);
  const diff = Math.abs(homeScore - awayScore);

  if (diff <= 4) return "Partido muy igualado en las apuestas";
  return homeScore > awayScore ? shortTeamName(home) : shortTeamName(away);
}

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

function footballPrizeAtStake(competition?: string | null): string | null {
  const blob = `${competition ?? ""}`.toLowerCase();
  const isFinal = /· final|\bfinal\b/i.test(blob);

  if (/champions/i.test(blob)) {
    if (isFinal) return "Título europeo y ~20 M€ de premio UEFA al campeón";
    if (/semi/i.test(blob)) return "Plaza en la final y millones en premios UEFA";
    return "Clasificación y premios por fase en juego";
  }
  if (/europa/i.test(blob) && isFinal) {
    return "Título de la Europa League y ~8,6 M€ al campeón";
  }
  if (/conference/i.test(blob) && isFinal) {
    return "Título de la Conference League y acceso a Europa League";
  }
  if (/mundial|world cup/i.test(blob) && isFinal) {
    return "Título mundial y trofeo FIFA";
  }
  if (/libertadores/i.test(blob) && isFinal) {
    return "Copa Libertadores en juego";
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
  const channels = parseChannels(event.platform).join(" · ");

  if (sport === "futbol") {
    pushDetail(rows, "Fase", footballPhase(event.competition));
    pushDetail(rows, "Contexto", footballSpotlightMeta(event.competition));
    pushDetail(rows, "Partido", event.title);
    pushDetail(rows, "En juego", footballPrizeAtStake(event.competition));
    pushDetail(
      rows,
      "Favorito apuestas",
      bettingFavoriteHint(event.home_team, event.away_team)
    );
    pushDetail(rows, "Dónde ver", channels || event.platform);
    return rows;
  }

  if (sport === "ufc") {
    const kind = parseUfcKindFromSource(event.source);
    pushDetail(rows, "Tipo de evento", ufcKindLabel(kind));
    pushDetail(rows, "Cartelera", event.title);
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
    pushDetail(
      rows,
      "Favorito apuestas",
      bettingFavoriteHint(event.home_team, event.away_team)
    );
    pushDetail(rows, "Plataforma", channels || event.platform || "Twitch");
    return rows;
  }

  if (sport === "cine" || sport === "series") {
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
    pushDetail(rows, "Interés", tmdbInterestLabel(event.source));
    pushDetail(rows, "Dónde ver", channels || event.platform);
    return rows;
  }

  pushDetail(rows, "Evento", event.title);
  pushDetail(rows, "Competición", event.competition);
  pushDetail(rows, "Deporte", sportLabel(sport));
  pushDetail(rows, "Dónde ver", channels || event.platform);
  return rows;
}

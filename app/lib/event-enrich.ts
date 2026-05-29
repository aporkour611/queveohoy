import type { EventRow } from "../components/types";
import { isBlockedSport } from "./blocked-sports";
import {
  encodeEsportsSource,
  pandascoreTeamLogo,
  pandascoreTeamLogoCandidates,
} from "./esports";
import { eventHasTeamCrests } from "./event-crests";
import { isImportantEvent } from "./featured";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function enrichFootballEvent(e: EventRow): Promise<EventRow | null> {
  const matchId = e.external_id?.match(/^football_(\d+)$/)?.[1];
  if (!matchId || !process.env.FOOTBALL_DATA_API_KEY) return null;

  const res = await fetch(`https://api.football-data.org/v4/matches/${matchId}`, {
    headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY },
  });
  if (!res.ok) return null;

  const match = await res.json();
  if (!match?.homeTeam?.id || !match?.awayTeam?.id) return null;

  return {
    ...e,
    home_team: match.homeTeam.name ?? e.home_team,
    away_team: match.awayTeam.name ?? e.away_team,
    source: `football-data:${match.homeTeam.id}:${match.awayTeam.id}`,
  };
}

async function enrichEsportsEvent(e: EventRow): Promise<EventRow | null> {
  const matchId = e.external_id?.match(/^esports_(\d+)$/)?.[1];
  if (!matchId || !process.env.PANDASCORE_API_KEY) return null;

  const res = await fetch(`https://api.pandascore.co/matches/${matchId}`, {
    headers: { Authorization: `Bearer ${process.env.PANDASCORE_API_KEY}` },
  });
  if (!res.ok) return null;

  const match = await res.json();
  const homeOp = match.opponents?.[0]?.opponent;
  const awayOp = match.opponents?.[1]?.opponent;
  const homeCandidates = pandascoreTeamLogoCandidates(homeOp);
  const awayCandidates = pandascoreTeamLogoCandidates(awayOp);
  const homeLogo = homeCandidates[0] ?? pandascoreTeamLogo(homeOp);
  const awayLogo = awayCandidates[0] ?? pandascoreTeamLogo(awayOp);

  if (!homeLogo || !awayLogo) return null;

  return {
    ...e,
    home_team: homeOp?.name ?? e.home_team,
    away_team: awayOp?.name ?? e.away_team,
    source: encodeEsportsSource(homeLogo, awayLogo),
  };
}

async function enrichOnce(e: EventRow): Promise<EventRow | null> {
  if (e.sport === "futbol") return enrichFootballEvent(e);
  if (["csgo", "valorant", "lol"].includes(e.sport ?? "")) {
    return enrichEsportsEvent(e);
  }
  return null;
}

/** Reintenta enriquecer escudos/logos vía API (solo eventos importantes) */
export async function enrichEventCrests(
  e: EventRow,
  maxRetries = 3
): Promise<EventRow | null> {
  if (isBlockedSport(e.sport)) return null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) await sleep(500 * attempt);
    const enriched = await enrichOnce(e);
    if (!enriched) continue;
    if (eventHasTeamCrests(enriched)) return enriched;
    if (isImportantEvent(e) && enriched.source !== e.source) return enriched;
  }
  return null;
}

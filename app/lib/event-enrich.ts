import type { EventRow } from "../components/types";
import { encodeEsportsSource, pandascoreTeamLogo } from "./esports";
import { eventHasTeamCrests } from "./event-crests";

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
  const homeLogo = pandascoreTeamLogo(match.opponents?.[0]?.opponent);
  const awayLogo = pandascoreTeamLogo(match.opponents?.[1]?.opponent);
  if (!homeLogo || !awayLogo) return null;

  return {
    ...e,
    home_team: match.opponents?.[0]?.opponent?.name ?? e.home_team,
    away_team: match.opponents?.[1]?.opponent?.name ?? e.away_team,
    source: encodeEsportsSource(homeLogo, awayLogo),
  };
}

async function enrichOnce(e: EventRow): Promise<EventRow | null> {
  if (e.sport === "futbol") return enrichFootballEvent(e);
  if (["csgo", "valorant", "lol", "dota2"].includes(e.sport ?? "")) {
    return enrichEsportsEvent(e);
  }
  return null;
}

/** Reintenta enriquecer escudos/logos vía API (solo eventos importantes) */
export async function enrichEventCrests(
  e: EventRow,
  maxRetries = 3
): Promise<EventRow | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) await sleep(500 * attempt);
    const enriched = await enrichOnce(e);
    if (enriched && eventHasTeamCrests(enriched)) return enriched;
  }
  return null;
}

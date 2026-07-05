import type { EventRow } from "../components/types";
import {
  parseBasketTeamLogos,
  basketLogoFallbackUrls,
} from "./basketball";
import { parseEsportsTeamLogos, esportsLogoFallbackUrls } from "./esports";
import { parseFootballTeamIds } from "./football";
import {
  resolveBasketCrestUrls,
  resolveEsportsCrestUrls,
  resolveFootballCrestUrls,
} from "./pinned-images";

export type EventCrestUrls = {
  homeCrestUrls: string[];
  awayCrestUrls: string[];
  homeCrest: string | null;
  awayCrest: string | null;
};

/** Listas de escudo con pins locales primero — feed cards y duelos. */
export function resolveEventCrestUrlLists(event: EventRow): EventCrestUrls {
  const esportsLogos = parseEsportsTeamLogos(event.source);
  const basketLogos =
    event.sport === "basket"
      ? parseBasketTeamLogos(event.source, event.home_team, event.away_team)
      : null;
  const footballIds =
    event.sport === "futbol"
      ? parseFootballTeamIds(
          event.external_id,
          event.source,
          event.home_team,
          event.away_team
        )
      : null;

  const homeCrestUrls = esportsLogos?.homeUrl
    ? resolveEsportsCrestUrls(
        esportsLogos.homeUrl,
        esportsLogoFallbackUrls(esportsLogos.homeUrl)
      )
    : basketLogos?.homeAbbr
      ? resolveBasketCrestUrls(
          basketLogos.homeAbbr,
          basketLogoFallbackUrls(basketLogos.homeAbbr)
        )
      : footballIds
        ? resolveFootballCrestUrls(footballIds.homeId)
        : [];

  const awayCrestUrls = esportsLogos?.awayUrl
    ? resolveEsportsCrestUrls(
        esportsLogos.awayUrl,
        esportsLogoFallbackUrls(esportsLogos.awayUrl)
      )
    : basketLogos?.awayAbbr
      ? resolveBasketCrestUrls(
          basketLogos.awayAbbr,
          basketLogoFallbackUrls(basketLogos.awayAbbr)
        )
      : footballIds
        ? resolveFootballCrestUrls(footballIds.awayId)
        : [];

  return {
    homeCrestUrls,
    awayCrestUrls,
    homeCrest: homeCrestUrls[0] ?? null,
    awayCrest: awayCrestUrls[0] ?? null,
  };
}

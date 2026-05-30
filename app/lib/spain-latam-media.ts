import type { EventRow } from "../components/types";
import { isCuratedSeriesEvent } from "./curated-series-events";
import { isCuratedMovieEvent } from "./movies-curated";
import { isFlagshipSpanishTvEvent } from "./curated-tv-events";

/** Programas US sin interés en España/LATAM (game shows, reality US…). */
const EXCLUDED_US_TV_TITLE =
  /^(the\s+)?jeopardy!?(\s|$)|^wheel of fortune|^the price is right|^family feud|^deal or no deal|^survivor(\s|$)|^american idol|^the bachelor|^the bachelorette|^love island(\s|$)|^big brother(\s|$)|^the amazing race|^dancing with the stars|^so you think you can dance|^america'?s got talent|^the voice(\s|$|\s*\()|^the masked singer(\s|$)|^ninja warrior|^hollywood squares|^match game|^press your luck/i;

const LATAM_RELEVANCE =
  /méxico|mexico|argentina|colombia|chile|perú|peru|venezuela|ecuador|uruguay|paraguay|bolivia|costa rica|guatemala|panamá|panama|españa|spain|eurovisi|master\s*chef|gran hermano|operaci[oó]n triunfo|la isla|first dates|survivor\s+(?:espa|all\s*stars)|the\s+traitors/i;

const SPANISH_BROADCAST =
  /rtve|telecinco|antena|atresmedia|la\s*1|la\s*2|cuatro|factor\s*x|got\s*talent\s*espa|first\s*dates/i;

export function isExcludedUsTvTitle(title: string): boolean {
  const trimmed = title.trim();
  if (!trimmed) return false;
  return EXCLUDED_US_TV_TITLE.test(trimmed);
}

export function isSpainLatamRelevantTvTitle(
  title: string,
  networks?: Array<string | null | undefined>
): boolean {
  const trimmed = title.trim();
  if (!trimmed) return false;
  if (isExcludedUsTvTitle(trimmed)) return false;

  const blob = `${trimmed} ${(networks ?? []).filter(Boolean).join(" ")}`;
  if (LATAM_RELEVANCE.test(blob)) return true;
  if (SPANISH_BROADCAST.test(blob)) return true;

  return false;
}

/** Filtra TV/series TMDB sin interés en España; deportes y curados siempre pasan. */
export function isSpainLatamRelevantMediaEvent(event: EventRow): boolean {
  const sport = event.sport ?? "";
  if (sport !== "tv" && sport !== "series") return true;

  if (
    isCuratedMovieEvent(event) ||
    isCuratedSeriesEvent(event) ||
    isFlagshipSpanishTvEvent(event)
  ) {
    return true;
  }

  const externalId = event.external_id ?? "";
  if (externalId.startsWith("manual_tv_") || externalId.startsWith("curated_tv_")) {
    return true;
  }

  const title = event.title ?? "";
  if (isExcludedUsTvTitle(title)) return false;

  if (sport === "series") {
    const platform = event.platform ?? "";
    if (/hbo max|netflix|prime|disney|movistar|filmin|apple tv|paramount|sky showtime|rtve/i.test(platform)) {
      return true;
    }
    return isSpainLatamRelevantTvTitle(title);
  }

  if (externalId.includes("tmdb_tv_reality_")) {
    return isSpainLatamRelevantTvTitle(title);
  }

  return true;
}

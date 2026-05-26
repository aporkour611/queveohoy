import {
  JUSTWATCH_SITE,
  justWatchTitleUrl,
  type JustWatchAvailability,
  type JustWatchMediaRef,
  type JustWatchOfferView,
} from "./justwatch-shared";

export type {
  JustWatchAvailability,
  JustWatchMediaRef,
  JustWatchOfferView,
} from "./justwatch-shared";

export {
  JUSTWATCH_SITE,
  justWatchTitleUrl,
  parseJustWatchMediaRef,
} from "./justwatch-shared";

export const JUSTWATCH_API_ROOT =
  "https://apis.justwatch.com/contentpartner/v2/content";
export const JUSTWATCH_LOCALE = "es_ES";

const PROVIDERS_TTL_MS = 24 * 60 * 60 * 1000;
const MONETIZATION_ORDER: Record<string, number> = {
  flatrate: 0,
  free: 1,
  ads: 2,
  rent: 3,
  buy: 4,
};

type RawOffer = {
  monetization_type?: string;
  provider_id?: number;
  retail_price?: number;
  currency?: string;
  urls?: { standard_web?: string };
};

type RawUpcoming = {
  release_type?: string;
  release_window_from?: string;
  release_window_to?: string;
};

type RawTitleResponse = {
  title?: string;
  full_path?: string;
  offers?: RawOffer[] | null;
  upcoming?: RawUpcoming[];
  episodes?: {
    season_number?: number;
    episode_number?: number;
    episode_offers?: RawOffer[];
  }[];
};

type RawProvider = {
  id: number;
  clear_name?: string;
  icon_url?: string;
};

let providersCache: {
  expiresAt: number;
  byId: Map<number, RawProvider>;
} | null = null;

export function getJustWatchPartnerToken(): string | undefined {
  return (
    process.env.JUSTWATCH_PARTNER_TOKEN?.trim() ||
    process.env.JUSTWATCH_API_KEY?.trim() ||
    process.env.JUSTWATCH_TOKEN?.trim()
  );
}

function monetizationLabel(type?: string): string {
  switch (type) {
    case "flatrate":
      return "Suscripción";
    case "free":
      return "Gratis";
    case "ads":
      return "Con anuncios";
    case "rent":
      return "Alquiler";
    case "buy":
      return "Compra";
    default:
      return "Disponible";
  }
}

function formatPrice(price?: number, currency?: string): string | undefined {
  if (price == null || Number.isNaN(price)) return undefined;
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${price} ${currency ?? "EUR"}`;
  }
}

function upcomingMessage(upcoming?: RawUpcoming[]): string | undefined {
  const next = upcoming?.[0];
  if (!next?.release_window_from) return undefined;

  const from = next.release_window_from.slice(0, 10);
  const to = next.release_window_to?.slice(0, 10);
  const type =
    next.release_type === "theatrical"
      ? "Estreno en cines"
      : next.release_type === "digital"
        ? "Próximo en streaming"
        : "Próximo estreno";

  if (to && to !== from) return `${type}: ${from} – ${to}`;
  return `${type}: ${from}`;
}

function pickEpisodeOffers(
  response: RawTitleResponse,
  season?: number,
  episode?: number
): RawOffer[] {
  if (!season || !response.episodes?.length) return response.offers ?? [];

  const match = response.episodes.find(
    (item) => item.season_number === season && item.episode_number === episode
  );
  if (match?.episode_offers?.length) return match.episode_offers;
  return response.offers ?? [];
}

function offerRank(type?: string): number {
  return MONETIZATION_ORDER[type ?? ""] ?? 99;
}

function normalizeOffers(
  rawOffers: RawOffer[],
  providers: Map<number, RawProvider>
): JustWatchOfferView[] {
  const deduped = new Map<string, { offer: JustWatchOfferView; rank: number }>();

  for (const raw of rawOffers) {
    const url = raw.urls?.standard_web?.trim();
    const providerId = raw.provider_id;
    if (!url || !providerId) continue;

    const provider = providers.get(providerId);
    const providerName = provider?.clear_name?.trim() || `Proveedor ${providerId}`;
    const key = `${providerId}:${raw.monetization_type ?? "unknown"}`;
    const rank = offerRank(raw.monetization_type);
    const next: JustWatchOfferView = {
      providerName,
      providerIcon: provider?.icon_url ?? undefined,
      monetizationLabel: monetizationLabel(raw.monetization_type),
      priceLabel: formatPrice(raw.retail_price, raw.currency),
      url,
    };

    const existing = deduped.get(key);
    if (!existing || rank < existing.rank) {
      deduped.set(key, { offer: next, rank });
    }
  }

  return [...deduped.values()]
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.offer.providerName.localeCompare(b.offer.providerName, "es")
    )
    .map((item) => item.offer);
}

function buildOffersUrl(ref: JustWatchMediaRef, useDeprecatedPath: boolean): string {
  const { objectType, tmdbId, season } = ref;
  const token = getJustWatchPartnerToken();
  if (!token) return "";

  if (objectType === "show" && season) {
    if (useDeprecatedPath) {
      return `${JUSTWATCH_API_ROOT}/offers/object_type/show/id_type/tmdb/id/${tmdbId}/season_number/${season}/locale/${JUSTWATCH_LOCALE}?token=${encodeURIComponent(token)}`;
    }
    return `${JUSTWATCH_API_ROOT}/offers/object_type/show/id_type/tmdb/season_number/${season}/locale/${JUSTWATCH_LOCALE}?id=${tmdbId}&token=${encodeURIComponent(token)}`;
  }

  if (useDeprecatedPath) {
    return `${JUSTWATCH_API_ROOT}/offers/object_type/${objectType}/id_type/tmdb/id/${tmdbId}/locale/${JUSTWATCH_LOCALE}?token=${encodeURIComponent(token)}`;
  }

  return `${JUSTWATCH_API_ROOT}/offers/object_type/${objectType}/id_type/tmdb/locale/${JUSTWATCH_LOCALE}?id=${tmdbId}&token=${encodeURIComponent(token)}`;
}

async function fetchOffersResponse(
  ref: JustWatchMediaRef
): Promise<RawTitleResponse | null> {
  const attempts = [false, true];

  for (const useDeprecatedPath of attempts) {
    const url = buildOffersUrl(ref, useDeprecatedPath);
    if (!url) return null;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      return res.json() as Promise<RawTitleResponse>;
    }

    console.error(
      `JustWatch ${useDeprecatedPath ? "legacy" : "v2"} ${ref.objectType}/${ref.tmdbId}: HTTP ${res.status}`
    );
  }

  return null;
}

async function getProvidersById(): Promise<Map<number, RawProvider>> {
  const now = Date.now();
  if (providersCache && providersCache.expiresAt > now) {
    return providersCache.byId;
  }

  const token = getJustWatchPartnerToken();
  if (!token) return new Map();

  const res = await fetch(
    `${JUSTWATCH_API_ROOT}/providers/all/locale/${JUSTWATCH_LOCALE}?token=${encodeURIComponent(token)}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    console.error(`JustWatch providers: HTTP ${res.status}`);
    return new Map();
  }

  const data = (await res.json()) as RawProvider[];
  const byId = new Map<number, RawProvider>();
  for (const provider of data ?? []) {
    if (provider.id) byId.set(provider.id, provider);
  }

  providersCache = {
    expiresAt: now + PROVIDERS_TTL_MS,
    byId,
  };

  return byId;
}

export async function fetchJustWatchAvailability(
  ref: JustWatchMediaRef
): Promise<JustWatchAvailability | null> {
  if (!getJustWatchPartnerToken()) return null;

  const [providers, response] = await Promise.all([
    getProvidersById(),
    fetchOffersResponse(ref),
  ]);

  if (!response) return null;

  const titleUrl =
    justWatchTitleUrl(response.full_path) ??
    `${JUSTWATCH_SITE}/es/buscar?q=${encodeURIComponent(response.title ?? "")}`;

  const rawOffers =
    ref.objectType === "show" && ref.season
      ? pickEpisodeOffers(response, ref.season, ref.episode)
      : (response.offers ?? []);

  const offers = normalizeOffers(rawOffers, providers).slice(0, 8);
  const statusMessage =
    offers.length === 0 ? upcomingMessage(response.upcoming) : undefined;

  return {
    title: response.title,
    titleUrl,
    offers,
    statusMessage,
  };
}

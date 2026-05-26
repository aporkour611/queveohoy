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

type RawTitleResponse = {
  title?: string;
  full_path?: string;
  offers?: RawOffer[];
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
  return process.env.JUSTWATCH_PARTNER_TOKEN?.trim();
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

async function justWatchFetch<T>(path: string): Promise<T | null> {
  const token = getJustWatchPartnerToken();
  if (!token) return null;

  const url = `${JUSTWATCH_API_ROOT}${path}${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    console.error(`JustWatch ${path}: HTTP ${res.status}`);
    return null;
  }

  return res.json() as Promise<T>;
}

async function getProvidersById(): Promise<Map<number, RawProvider>> {
  const now = Date.now();
  if (providersCache && providersCache.expiresAt > now) {
    return providersCache.byId;
  }

  const data = await justWatchFetch<RawProvider[]>(
    `/providers/all/locale/${JUSTWATCH_LOCALE}`
  );

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

function offersPath(ref: JustWatchMediaRef): string {
  const { objectType, tmdbId, season } = ref;

  if (objectType === "show" && season) {
    return `/offers/object_type/show/id_type/tmdb/id/${tmdbId}/season_number/${season}/locale/${JUSTWATCH_LOCALE}`;
  }

  return `/offers/object_type/${objectType}/id_type/tmdb/id/${tmdbId}/locale/${JUSTWATCH_LOCALE}`;
}

export async function fetchJustWatchAvailability(
  ref: JustWatchMediaRef
): Promise<JustWatchAvailability | null> {
  if (!getJustWatchPartnerToken()) return null;

  const [providers, response] = await Promise.all([
    getProvidersById(),
    justWatchFetch<RawTitleResponse>(offersPath(ref)),
  ]);

  if (!response) return null;

  const titleUrl =
    justWatchTitleUrl(response.full_path) ??
    `${JUSTWATCH_SITE}/es/buscar?q=${encodeURIComponent(response.title ?? "")}`;

  const rawOffers =
    ref.objectType === "show" && ref.season
      ? pickEpisodeOffers(response, ref.season, ref.episode)
      : (response.offers ?? []);

  return {
    title: response.title,
    titleUrl,
    offers: normalizeOffers(rawOffers, providers).slice(0, 8),
  };
}

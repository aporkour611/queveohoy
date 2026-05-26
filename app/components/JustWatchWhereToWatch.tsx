"use client";

import { useEffect, useMemo, useState } from "react";
import {
  parseJustWatchMediaRef,
  type JustWatchAvailability,
} from "../lib/justwatch-shared";
import { JustWatchBrandedLink } from "./JustWatchBrandedLink";

type Props = {
  sport?: string | null;
  externalId?: string | null;
  compact?: boolean;
};

const responseCache = new Map<string, JustWatchAvailability | "error">();

export function JustWatchWhereToWatch({
  sport,
  externalId,
  compact = false,
}: Props) {
  const ref = useMemo(
    () => parseJustWatchMediaRef(sport, externalId),
    [sport, externalId]
  );
  const cacheKey = ref
    ? `${ref.objectType}:${ref.tmdbId}:${ref.season ?? 0}:${ref.episode ?? 0}`
    : null;

  const [data, setData] = useState<JustWatchAvailability | null>(null);
  const [loading, setLoading] = useState(Boolean(ref));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ref || !cacheKey) {
      setLoading(false);
      return;
    }

    const cached = responseCache.get(cacheKey);
    if (cached === "error") {
      setFailed(true);
      setLoading(false);
      return;
    }
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);

    const params = new URLSearchParams({
      sport: sport ?? "",
      externalId: externalId ?? "",
    });

    fetch(`/api/justwatch?${params}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<JustWatchAvailability>;
      })
      .then((payload) => {
        if (cancelled) return;
        responseCache.set(cacheKey, payload);
        setData(payload);
      })
      .catch(() => {
        if (cancelled) return;
        responseCache.set(cacheKey, "error");
        setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, externalId, ref, sport]);

  if (!ref) return null;

  const titleUrl =
    data?.titleUrl ?? "https://www.justwatch.com/es";

  return (
    <div
      className={`jw-watch${compact ? " jw-watch-compact" : ""}`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="jw-watch-head">
        <span className="jw-watch-label">Dónde ver</span>
        <JustWatchBrandedLink href={titleUrl} variant="gold" />
      </div>

      {loading ? (
        <p className="jw-watch-status">Buscando plataformas…</p>
      ) : failed ? (
        <p className="jw-watch-status">
          Activa tu token de JustWatch (JUSTWATCH_PARTNER_TOKEN) o consulta la ficha directamente.
        </p>
      ) : data?.offers.length ? (
        <ul className="jw-watch-list">
          {data.offers.slice(0, compact ? 3 : 6).map((offer) => (
            <li key={`${offer.providerName}-${offer.monetizationLabel}`}>
              <a
                href={offer.url}
                className="jw-watch-offer"
                target="_blank"
                rel="noopener noreferrer"
              >
                {offer.providerIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.providerIcon}
                    alt=""
                    className="jw-watch-provider-icon"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="jw-watch-provider-fallback" aria-hidden>
                    ▶
                  </span>
                )}
                <span className="jw-watch-offer-copy">
                  <span className="jw-watch-provider-name">{offer.providerName}</span>
                  <span className="jw-watch-offer-meta">
                    {offer.monetizationLabel}
                    {offer.priceLabel ? ` · ${offer.priceLabel}` : ""}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : data?.statusMessage ? (
        <p className="jw-watch-status">{data.statusMessage}</p>
      ) : (
        <p className="jw-watch-status">
          Sin plataformas listadas en España. Mira opciones en la ficha de JustWatch.
        </p>
      )}
    </div>
  );
}

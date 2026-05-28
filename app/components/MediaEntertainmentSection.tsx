"use client";

import "../media.css";
import type { EventRow } from "./types";
import { CatalogMediaSection } from "./CatalogMediaSection";
import { TvBroadcastSection } from "./TvBroadcastSection";

type Props = {
  cine: EventRow[];
  series: EventRow[];
  anime?: EventRow[];
  tvReality?: EventRow[];
  tvConcurso?: EventRow[];
  tvDirecto?: EventRow[];
};

export function MediaEntertainmentSection({
  cine,
  series,
  anime = [],
  tvReality = [],
  tvConcurso = [],
  tvDirecto = [],
}: Props) {
  const hasTv =
    tvReality.length > 0 || tvConcurso.length > 0 || tvDirecto.length > 0;
  const hasCatalog = cine.length > 0 || series.length > 0 || anime.length > 0;

  if (!hasTv && !hasCatalog) return null;

  return (
    <div className="qvh-entertainment-stack qvh-feed-surface">
      <TvBroadcastSection
        tvReality={tvReality}
        tvConcurso={tvConcurso}
        tvDirecto={tvDirecto}
      />
      <CatalogMediaSection cine={cine} series={series} anime={anime} />
    </div>
  );
}

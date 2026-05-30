"use client";

import { useMemo } from "react";
import type { EventRow } from "./types";
import { FeedPanelSection } from "./FeedPanelSection";
import { formatMediaGroupLabel, isMediaSportId } from "../lib/filter-config";
import type { FeedPanelSubgroup } from "../lib/feed-panel-config";

type Props = {
  cine: EventRow[];
  series: EventRow[];
  anime?: EventRow[];
  tvReality?: EventRow[];
  tvConcurso?: EventRow[];
  tvDirecto?: EventRow[];
  appliedSports?: string[];
  isFeaturedMode?: boolean;
  priority?: "high" | "normal";
};

export function MediaEntertainmentSection({
  cine,
  series,
  anime = [],
  tvReality = [],
  tvConcurso = [],
  tvDirecto = [],
  appliedSports = [],
  isFeaturedMode = true,
  priority = "normal",
}: Props) {
  const showCine = isFeaturedMode || appliedSports.includes("cine");
  const showSeries = isFeaturedMode || appliedSports.includes("series");
  const showAnime = isFeaturedMode || appliedSports.includes("anime");

  const tvSubgroups = useMemo((): FeedPanelSubgroup[] => {
    const groups: FeedPanelSubgroup[] = [];
    if (tvDirecto.length > 0) {
      groups.push({
        key: "directo",
        label: "TV",
        iconId: "tv-directo",
        events: tvDirecto,
        cardLayout: "tv",
      });
    }
    if (tvConcurso.length > 0) {
      groups.push({
        key: "concurso",
        label: "Concursos",
        iconId: "tv-concurso",
        events: tvConcurso,
        cardLayout: "tv",
      });
    }
    if (tvReality.length > 0) {
      groups.push({
        key: "reality",
        label: "Reality",
        iconId: "tv-reality",
        events: tvReality,
        cardLayout: "tv",
      });
    }
    return groups;
  }, [tvConcurso, tvDirecto, tvReality]);

  const catalogSubgroups = useMemo((): FeedPanelSubgroup[] => {
    const groups: FeedPanelSubgroup[] = [];
    const visibleCine = showCine ? cine : [];
    const visibleSeries = showSeries ? series : [];
    const visibleAnime = showAnime ? anime : [];

    if (visibleCine.length > 0) {
      groups.push({
        key: "cine",
        label: "En cines",
        iconId: "cine",
        events: visibleCine,
        cardLayout: "poster-cine",
      });
    }
    if (visibleSeries.length > 0) {
      groups.push({
        key: "series",
        label: "Capítulos y series",
        iconId: "series",
        events: visibleSeries,
        cardLayout: "poster",
      });
    }
    if (visibleAnime.length > 0) {
      groups.push({
        key: "anime",
        label: "Anime",
        iconId: "anime",
        events: visibleAnime,
        cardLayout: "poster-anime",
      });
    }
    return groups;
  }, [anime, cine, series, showAnime, showCine, showSeries]);

  const catalogTitle = isFeaturedMode
    ? "Cine, series y anime"
    : formatMediaGroupLabel(appliedSports.filter(isMediaSportId));

  if (tvSubgroups.length === 0 && catalogSubgroups.length === 0) return null;

  return (
    <>
      <FeedPanelSection
        panel="tv"
        subgroups={tvSubgroups}
        priority={priority}
      />
      <FeedPanelSection
        panel="catalog"
        subgroups={catalogSubgroups}
        titleOverride={catalogTitle}
        ariaLabelOverride={catalogTitle}
        priority={priority}
      />
    </>
  );
}

import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { getDestacadoImportanceTier } from "./destacados-importance";
import { buildWeekDestacadosPresentation } from "./destacados-week-present";
import { getSpotlightCardModel } from "./featured-card";
import { FEED_DAY_COUNT } from "./events-feed";
import {
  resolveHomeLcpPreloadEntries,
  resolveLcpPreloadEntryFromCard,
  resolveLcpPreloadEntryFromCover,
  resolveLcpPriorityIndex,
} from "./home-lcp";
import { LCP_TMDB_POSTER_WIDTH, resolveLcpCoverImgSrc } from "./lcp-poster";
import { MADRID_TZ } from "./timezone";

const maskSingerEvent: EventRow = {
  id: 9001,
  title: "Mask Singer",
  sport: "tv",
  date: "2026-05-27",
  time: "23:00",
  competition: "Concurso · Mask Singer",
  platform: "Antena 3 · ATRESPLAYER TV",
};

const esportsValorantEvent: EventRow = {
  id: 101,
  title: "Team A vs Team B",
  sport: "valorant",
  date: "2026-05-27",
  time: "18:00",
  home_team: "Alpha",
  away_team: "Beta",
  competition: "VCT",
  platform: "Twitch",
  source:
    "pandascore-logos:https://cdn.pandascore.co/images/team/image/1/a.png::https://cdn.pandascore.co/images/team/image/2/b.png",
};

const elDramaEvent: EventRow = {
  id: 102,
  title: "El drama",
  sport: "cine",
  date: "2026-05-29",
  time: "22:00",
  competition: "Cine",
  platform: "Cines",
  external_id: "tmdb_movie_1325734",
};

describe("resolveHomeLcpPreloadEntries", () => {
  it("resolves mask singer editorial poster on spotlight card", () => {
    const cover = getSpotlightCardModel(maskSingerEvent, MADRID_TZ).coverImage;

    expect(cover?.local).toBe(true);
    expect(cover?.url).toBe("/posters/mask-singer.webp");
  });

  it("preloads poster local raster para LCP (sin /_next/image)", () => {
    const cover = getSpotlightCardModel(maskSingerEvent, MADRID_TZ).coverImage!;
    const entry = resolveLcpPreloadEntryFromCover(cover);

    expect(entry?.href).toBe("/posters/mask-singer.webp");
    expect(entry?.href).not.toContain("/_next/image");
    expect(resolveLcpCoverImgSrc(cover.url, cover.local)).toBe(entry?.href);
  });

  it("prefiere poster local mismo origen sobre TMDB para LCP", () => {
    const localTv: EventRow = {
      id: 9002,
      title: "Gran Hermano",
      sport: "tv",
      date: "2026-05-27",
      time: "22:00",
      competition: "Reality",
      platform: "Telecinco",
      source: "editorial",
    };
    const cover = getSpotlightCardModel(localTv, MADRID_TZ).coverImage!;
    const entry = resolveLcpPreloadEntryFromCover(cover);

    expect(cover.local).toBe(true);
    expect(entry?.href).toBe("/posters/gran-hermano.webp");
    expect(entry?.href).not.toContain("image.tmdb.org");
  });

  it("elige pasapalabra local como LCP cuando está en destacados curados", () => {
    const entries = resolveHomeLcpPreloadEntries([maskSingerEvent], "2026-05-27");

    expect(entries[0]?.href).toBe("/posters/pasapalabra.webp");
  });

  it("precarga retrato LCP UFC en ventana Casablanca", () => {
    const entries = resolveHomeLcpPreloadEntries([], "2026-06-10");

    expect(entries.length).toBe(1);
    expect(entries[0]?.href).toContain("/deportes/ufc/topuria-lcp.webp");
  });

  it("clasifica Mask Singer en la categoría rest de destacados", () => {
    expect(getDestacadoImportanceTier(maskSingerEvent)).toBe("rest");
  });

  it("returns preload entry for visible destacado covers", () => {
    const todayKey = "2026-05-27";
    const entries = resolveHomeLcpPreloadEntries([], todayKey);

    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries[0]?.href.length).toBeGreaterThan(0);
  });

  it("prefiere poster TMDB sobre esports duel para LCP y preload", () => {
    const events = [esportsValorantEvent, elDramaEvent];

    expect(resolveLcpPriorityIndex(events)).toBe(1);

    const dramaCard = getSpotlightCardModel(elDramaEvent, MADRID_TZ);
    const entry = resolveLcpPreloadEntryFromCard(dramaCard);
    const imgSrc = resolveLcpCoverImgSrc(
      dramaCard.coverImage!.url,
      dramaCard.coverImage!.local
    );

    expect(entry?.href).toContain("image.tmdb.org");
    expect(entry?.href).toContain(`/${LCP_TMDB_POSTER_WIDTH}/`);
    expect(entry?.href).toBe(imgSrc);
  });

  it("preload href coincide con img LCP del candidato elegido", () => {
    const todayKey = "2026-05-27";
    const events = [esportsValorantEvent, elDramaEvent];
    const { weekFeatured } = buildWeekDestacadosPresentation(
      events,
      todayKey,
      FEED_DAY_COUNT
    );
    const featured = weekFeatured.slice(0, 3);
    const winner = featured[resolveLcpPriorityIndex(featured)];
    const expected = resolveLcpPreloadEntryFromCard(
      getSpotlightCardModel(winner, MADRID_TZ)
    )?.href;
    const entries = resolveHomeLcpPreloadEntries(events, todayKey);

    expect(entries[0]?.href).toBe(expected);
    expect(entries[0]?.href).not.toContain("/_next/image");
  });
});

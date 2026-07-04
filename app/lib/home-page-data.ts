import { cache } from "react";
import type { Metadata } from "next";
import type { EventRow } from "../components/types";
import {
  getDestacadosFeedEventsForPage,
  getHomeFeedEventsForPage,
} from "./events-feed-server";
import { mergeFeedEvents } from "./merge-feed-events";
import { raceWithTimeout } from "./race-with-timeout";
import { buildHomeMetadataDescription, buildHomeMetadataTitle } from "./seo-jsonld";
import { defaultDescription, pageMetadata, seoKeywords } from "./seo";

const PAGE_DATA_BUDGET_MS = 5_000;

const PAGE_DATA_FALLBACK = {
  events: [] as Awaited<ReturnType<typeof getHomeFeedEventsForPage>>["events"],
  error: "La agenda tardó demasiado en cargar.",
  weekEvents: [] as Awaited<
    ReturnType<typeof getDestacadosFeedEventsForPage>
  >["events"],
};

/** Una sola carga por petición (generateMetadata + Page comparten React cache). */
export const loadHomePageData = cache(async (): Promise<{
  events: Awaited<ReturnType<typeof getHomeFeedEventsForPage>>["events"];
  error: string | null;
  weekEvents: Awaited<ReturnType<typeof getDestacadosFeedEventsForPage>>["events"];
}> => {
  return raceWithTimeout(
    Promise.allSettled([
      getHomeFeedEventsForPage(),
      getDestacadosFeedEventsForPage(),
    ]).then((results) => {
      const home =
        results[0].status === "fulfilled"
          ? results[0].value
          : { events: [] as EventRow[], error: "No se pudo cargar la agenda de hoy." };
      const destacados =
        results[1].status === "fulfilled"
          ? results[1].value
          : { events: [] as EventRow[], error: "No se pudo cargar destacados." };

      const errors = [home.error, destacados.error].filter(Boolean);
      return {
        events: home.events,
        weekEvents: destacados.events,
        error:
          home.events.length === 0 && destacados.events.length === 0
            ? errors[0] ?? PAGE_DATA_FALLBACK.error
            : errors.length === 2
              ? errors.join(" ")
              : null,
      };
    }),
    PAGE_DATA_BUDGET_MS,
    () => PAGE_DATA_FALLBACK
  );
});

export async function buildHomePageMetadata(): Promise<Metadata> {
  const { events, weekEvents } = await loadHomePageData();
  const merged = mergeFeedEvents(events, weekEvents);
  const description =
    merged.length > 0
      ? buildHomeMetadataDescription(merged)
      : defaultDescription;

  return pageMetadata(
    "/",
    buildHomeMetadataTitle(),
    description,
    seoKeywords
  );
}

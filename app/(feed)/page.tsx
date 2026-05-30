import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { EventRow } from "../components/types";
import { DestacadosSection } from "../components/DestacadosSection";
import { FeedControlsShell } from "../components/FeedControlsShell";
import { FilterCssIntentBridge } from "../components/FilterCssIntentBridge";
import { HomeFeedDayHeader } from "../components/HomeFeedDayHeader";
import { HomeFeedDayStatic } from "../components/HomeFeedDayStatic";
import { TonightForYouSectionStatic } from "../components/TonightForYouSectionStatic";
import { HOME_SSR_DAY_COUNT } from "../lib/home-feed-config";
import { mergeFeedEvents } from "../lib/merge-feed-events";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { HomeJsonLd } from "../components/HomeJsonLd";
import { HomeLcpPreload } from "../components/HomeLcpPreload";
import { HomeNav } from "../components/HomeNav";
import { SiteFooter } from "../components/SiteFooter";
import { eventsForHomeSsrHtml } from "../lib/featured";
import {
  getDestacadosFeedEventsForPage,
  getHomeFeedEventsForPage,
} from "../lib/events-feed-server";
import { raceWithTimeout } from "../lib/race-with-timeout";
import { resolveHomeLcpPreloadEntries } from "../lib/home-lcp";
import { buildHomeMetadataDescription, buildHomeMetadataTitle } from "../lib/seo-jsonld";
import { defaultDescription, pageMetadata, seoKeywords } from "../lib/seo";
import { pickWeekDestacados } from "../lib/destacados-config";
import { resolveChampionsWeekContext } from "../lib/champions-week";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import {
  getSpotlightCardModel,
  spotlightHasCompleteTeamCover,
} from "../lib/featured-card";

const HomeFaq = dynamic(
  () => import("../components/HomeFaq").then((mod) => mod.HomeFaq),
  { ssr: true }
);
const SeoGuidesPromo = dynamic(
  () =>
    import("../components/SeoGuidesPromo").then((mod) => mod.SeoGuidesPromo),
  { ssr: true }
);
import { FeedHydrationBootstrap } from "../components/FeedHydrationBootstrap";

export const revalidate = 900;
export const maxDuration = 25;

const PAGE_DATA_BUDGET_MS = 8_000;

const PAGE_DATA_FALLBACK = {
  events: [] as Awaited<ReturnType<typeof getHomeFeedEventsForPage>>["events"],
  error: "La agenda tardó demasiado en cargar.",
  weekEvents: [] as Awaited<
    ReturnType<typeof getDestacadosFeedEventsForPage>
  >["events"],
};

async function loadHomePageData(): Promise<{
  events: Awaited<ReturnType<typeof getHomeFeedEventsForPage>>["events"];
  error: string | null;
  weekEvents: Awaited<ReturnType<typeof getDestacadosFeedEventsForPage>>["events"];
}> {
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
}

function resolveDestacadosEnhancerProps(
  weekEvents: EventRow[],
  todayKey: string
) {
  const championsWeek = resolveChampionsWeekContext(
    weekEvents,
    todayKey,
    FEED_DAY_COUNT
  );
  const championsFinalId = championsWeek?.finalEvent.id;

  const weekFeatured = pickWeekDestacados(weekEvents, { todayKey }).filter(
    (event) => {
      if (championsFinalId != null && event.id === championsFinalId) return true;
      return spotlightHasCompleteTeamCover(getSpotlightCardModel(event, MADRID_TZ));
    }
  );

  if (weekFeatured.length === 0) return null;

  const subtitle = championsWeek
    ? "La gran final y lo más esperado del fin de semana"
    : "Estrenos, finales y series que marcan la semana";

  return {
    title: "Esta semana",
    subtitle,
    items: weekFeatured,
    ariaLabel: "Destacados de la semana",
    className: `qvh-destacados-week qvh-destacados-week-first${
      championsWeek ? " qvh-cl-week-destacados" : ""
    }`,
  };
}

export async function generateMetadata(): Promise<Metadata> {
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

export default async function Page() {
  const { events, error, weekEvents } = await loadHomePageData();
  const mergedForSsr = mergeFeedEvents(events, weekEvents);
  const ssrEvents = eventsForHomeSsrHtml(mergedForSsr);
  const lcpPreloadEntries = resolveHomeLcpPreloadEntries(weekEvents);
  const initialDay = buildDisplayDays(MADRID_TZ, HOME_SSR_DAY_COUNT)[0];
  const shellDays = buildDisplayDays(MADRID_TZ, HOME_SSR_DAY_COUNT);
  const tonightEvents = mergeFeedEvents(ssrEvents, weekEvents);
  const todayKey = initialDay?.date ?? "";
  const destacadosEnhancer = resolveDestacadosEnhancerProps(weekEvents, todayKey);

  return (
    <>
      <HomeLcpPreload entries={lcpPreloadEntries} />
      <div className="fh-body">
          <HomeNav />
          <main id="main-content" className="fh-content">
            <div className="fh-container fh-main">
                <h1 className="sr-only">Qué ver hoy en TV</h1>

                <DestacadosSection events={weekEvents} />

                <TonightForYouSectionStatic events={tonightEvents} todayKey={todayKey} />

                <div className="qvh-home-feed-slot">
                  {ssrEvents.length > 0 ? (
                    <p className="qvh-feed-freshness qvh-feed-freshness-ssr" aria-hidden>
                      {`${ssrEvents.length} eventos en ventana`}
                    </p>
                  ) : null}
                  <FeedControlsShell days={shellDays} />
                  <FilterCssIntentBridge />
                  {initialDay ? (
                    <HomeFeedDayHeader
                      date={initialDay.date}
                      title={initialDay.title}
                    />
                  ) : null}
                  {initialDay ? (
                    <HomeFeedDayStatic
                      initialEvents={mergedForSsr}
                      initialDestacadosEvents={weekEvents}
                      dayDate={initialDay.date}
                    />
                  ) : null}
                  <FeedHydrationBootstrap
                    initialEvents={ssrEvents}
                    initialDestacadosEvents={weekEvents}
                    initialError={error}
                    serverDayHeaderDate={initialDay?.date ?? null}
                    initialEventCount={ssrEvents.length}
                    tonightEvents={tonightEvents}
                    todayKey={todayKey}
                    destacadosEnhancer={destacadosEnhancer}
                  />
                </div>
            </div>
            <SeoGuidesPromo />
            <HomeFaq />
            <SiteFooter />
          </main>
      </div>
      <HomeJsonLd events={mergedForSsr} />
    </>
  );
}

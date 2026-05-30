import type { Metadata } from "next";
import { DestacadosSection } from "../components/DestacadosSection";
import { FeedControlsShell } from "../components/FeedControlsShell";
import { HomeFeedDayHeader } from "../components/HomeFeedDayHeader";
import { HomeFeedDayStatic } from "../components/HomeFeedDayStatic";
import { HomeFeedGate } from "../components/HomeFeedGate";
import { HOME_SSR_DAY_COUNT } from "../lib/home-feed-config";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { HomeJsonLd } from "../components/HomeJsonLd";
import { HomeLcpPreload } from "../components/HomeLcpPreload";
import { HomeNav } from "../components/HomeNav";
import { PageFindBar } from "../components/PageFindBar";
import { HomeResetProvider } from "../components/HomeResetContext";
import { SiteFooter } from "../components/SiteFooter";
import { SeoGuidesPromo } from "../components/SeoGuidesPromo";
import { trimHomeSsrEvents } from "../lib/featured";
import {
  getDestacadosFeedEventsForPage,
  getHomeFeedEventsForPage,
} from "../lib/events-feed-server";
import { raceWithTimeout } from "../lib/race-with-timeout";
import { resolveHomeLcpPreloadEntries } from "../lib/home-lcp";
import { buildHomeMetadataTitle } from "../lib/seo-jsonld";
import { defaultDescription, pageMetadata, seoKeywords } from "../lib/seo";

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
    Promise.all([
      getHomeFeedEventsForPage(),
      getDestacadosFeedEventsForPage(),
    ]).then(([{ events, error }, { events: weekEvents }]) => ({
      events,
      error,
      weekEvents,
    })),
    PAGE_DATA_BUDGET_MS,
    () => PAGE_DATA_FALLBACK
  );
}

export function generateMetadata(): Metadata {
  return pageMetadata(
    "/",
    buildHomeMetadataTitle(),
    defaultDescription,
    seoKeywords
  );
}

export default async function Page() {
  const { events, error, weekEvents } = await loadHomePageData();
  const ssrEvents = trimHomeSsrEvents(events);
  const lcpPreloadEntries = resolveHomeLcpPreloadEntries(weekEvents);
  const initialDay = buildDisplayDays(MADRID_TZ, HOME_SSR_DAY_COUNT)[0];
  const shellDays = buildDisplayDays(MADRID_TZ, HOME_SSR_DAY_COUNT);

  return (
    <>
      <HomeLcpPreload entries={lcpPreloadEntries} />
      <HomeJsonLd events={ssrEvents} />
      <div className="fh-body">
        <HomeResetProvider>
          <HomeNav />
          <main id="main-content" className="fh-content">
            <div className="fh-main-layout">
              <div className="fh-container fh-main">
                <h1 className="sr-only">Qué ver hoy en TV</h1>

                <DestacadosSection events={weekEvents} />

                <div className="qvh-home-feed-slot">
                  <FeedControlsShell days={shellDays} />
                  {initialDay ? (
                    <HomeFeedDayHeader
                      date={initialDay.date}
                      title={initialDay.title}
                    />
                  ) : null}
                  {initialDay ? (
                    <HomeFeedDayStatic
                      initialEvents={ssrEvents}
                      initialDestacadosEvents={weekEvents}
                      dayDate={initialDay.date}
                    />
                  ) : null}
                  <HomeFeedGate
                    initialEvents={ssrEvents}
                    initialDestacadosEvents={weekEvents}
                    initialError={error}
                    serverDayHeaderDate={initialDay?.date ?? null}
                  />
                </div>
              </div>
              <PageFindBar containerId="main-content" />
            </div>
            <SeoGuidesPromo />
            <SiteFooter />
          </main>
        </HomeResetProvider>
      </div>
    </>
  );
}

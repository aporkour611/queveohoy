import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { EventRow } from "../components/types";
import { DestacadosSection } from "../components/DestacadosSection";
import { FeedFreshnessSlot } from "../components/FeedFreshnessSlot";
import { FeedControlsShell } from "../components/FeedControlsShell";
import { FeedControlsShellBridge } from "../components/FeedControlsShellBridge";
import { HomeFeedDayHeader } from "../components/HomeFeedDayHeader";
import { HomeFeedDayStatic } from "../components/HomeFeedDayStatic";
import { HomeFeedGate } from "../components/HomeFeedGate";
import { TonightForYouPersonalizer } from "../components/TonightForYouPersonalizer";
import { TonightForYouSectionStatic } from "../components/TonightForYouSectionStatic";
import { HOME_SSR_DAY_COUNT } from "../lib/home-feed-config";
import { mergeFeedEvents } from "../lib/merge-feed-events";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { HomeJsonLd } from "../components/HomeJsonLd";
import { HomeLcpPreload } from "../components/HomeLcpPreload";
import { HomeNav } from "../components/HomeNav";
import { HomeResetProvider } from "../components/HomeResetContext";
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

const HomeFaq = dynamic(
  () => import("../components/HomeFaq").then((mod) => mod.HomeFaq),
  { ssr: true }
);
const SeoGuidesPromo = dynamic(
  () =>
    import("../components/SeoGuidesPromo").then((mod) => mod.SeoGuidesPromo),
  { ssr: true }
);

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

  return (
    <>
      <HomeLcpPreload entries={lcpPreloadEntries} />
      <HomeJsonLd events={ssrEvents} />
      <div className="fh-body">
        <HomeResetProvider>
          <HomeNav />
          <main id="main-content" className="fh-content">
            <div className="fh-container fh-main">
                <h1 className="sr-only">Qué ver hoy en TV</h1>

                <DestacadosSection events={weekEvents} />

                <TonightForYouSectionStatic events={tonightEvents} todayKey={todayKey} />
                <TonightForYouPersonalizer events={tonightEvents} todayKey={todayKey} />

                <div className="qvh-home-feed-slot">
                  <FeedFreshnessSlot initialEventCount={ssrEvents.length} />
                  <FeedControlsShell days={shellDays} />
                  <FeedControlsShellBridge />
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
                    eager={ssrEvents.length === 0 || Boolean(error)}
                  />
                </div>
            </div>
            <SeoGuidesPromo />
            <HomeFaq />
            <SiteFooter />
          </main>
        </HomeResetProvider>
      </div>
    </>
  );
}

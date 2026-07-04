import { cache } from "react";
import { preload } from "react-dom";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import type { EventRow } from "./types";
import { DestacadosSection } from "./DestacadosSection";
import { FeedControlsShell } from "./FeedControlsShell";
import { HomeFeedDayHeader } from "./HomeFeedDayHeader";
import { HomeFeedDayStatic } from "./HomeFeedDayStatic";
import { TonightForYouSectionStatic } from "./TonightForYouSectionStatic";
import { HOME_SSR_DAY_COUNT } from "../lib/home-feed-config";
import { mergeFeedEvents } from "../lib/merge-feed-events";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { HomeJsonLd } from "./HomeJsonLd";
import { HomeLcpPreload } from "./HomeLcpPreload";
import { HomeNav } from "./HomeNav";
import { HomeNavStatic } from "./HomeNavStatic";
import { SiteFooter } from "./SiteFooter";
import { eventsForHomeSsrHtml } from "../lib/featured";
import {
  getDestacadosFeedEventsForPage,
  getHomeFeedEventsForPage,
} from "../lib/events-feed-server";
import { raceWithTimeout } from "../lib/race-with-timeout";
import { resolveHomeLcpPreloadEntries } from "../lib/home-lcp";
import { buildHomeMetadataDescription, buildHomeMetadataTitle } from "../lib/seo-jsonld";
import { defaultDescription, pageMetadata, seoKeywords } from "../lib/seo";
import { buildWeekDestacadosPresentation } from "../lib/destacados-week-present";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { isUfcWeekEditorialWindow, UFC_CASABLANCA_FALLBACK } from "../lib/ufc-week";
import { UfcDestacadosStatic } from "./UfcDestacadosStatic";
import { UfcHomeFeedShell } from "./UfcHomeFeedShell";
import { UfcHomeNav } from "./UfcHomeNav";
import { HomePageClientShell } from "./HomePageClientShell";

const HomeFaq = dynamic(
  () => import("./HomeFaq").then((mod) => mod.HomeFaq),
  { ssr: true }
);
const SeoGuidesPromo = dynamic(
  () => import("./SeoGuidesPromo").then((mod) => mod.SeoGuidesPromo),
  { ssr: true }
);

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

function resolveDestacadosEnhancerProps(
  weekEvents: EventRow[],
  todayKey: string
) {
  const presentation = buildWeekDestacadosPresentation(
    weekEvents,
    todayKey,
    FEED_DAY_COUNT
  );

  if (presentation.weekFeatured.length === 0) return null;

  return {
    title: "Esta semana",
    subtitle: presentation.subtitle,
    items: presentation.weekFeatured,
    ariaLabel: "Destacados de la semana",
    className: `qvh-destacados-week qvh-destacados-week-first${presentation.destacadosClassSuffix}`,
  };
}

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

type Props = {
  /** PSI/Lighthouse: sin client islands (chunk 3794). */
  audit?: boolean;
};

export async function HomeFeedPageServer({ audit = false }: Props) {
  const initialDay = buildDisplayDays(MADRID_TZ, HOME_SSR_DAY_COUNT)[0];
  const todayKey = initialDay?.date ?? "";
  const ufcEditorial = isUfcWeekEditorialWindow(todayKey);
  const shellDays = buildDisplayDays(MADRID_TZ, HOME_SSR_DAY_COUNT);
  const Nav = audit ? HomeNavStatic : HomeNav;

  if (ufcEditorial) {
    return (
      <>
        <HomeLcpPreload entries={resolveHomeLcpPreloadEntries([], todayKey)} />
        <div className="fh-body qvh-ufc-week-site qvh-ufc-priority-lcp">
          <UfcDestacadosStatic />
          <UfcHomeNav />
          <main id="main-content" className="fh-content">
            <div className="fh-container fh-main">
              <h1 className="sr-only">
                Topuria vs Gaethje — UFC Casablanca, horario y TV en España
              </h1>

              <UfcHomeFeedShell todayKey={todayKey} />
            </div>
            <SeoGuidesPromo />
            <HomeFaq />
            <SiteFooter />
          </main>
        </div>
        <HomeJsonLd events={[UFC_CASABLANCA_FALLBACK.event]} />
      </>
    );
  }

  const { events, error, weekEvents } = await loadHomePageData();
  const mergedForSsr = mergeFeedEvents(events, weekEvents);
  const ssrEvents = eventsForHomeSsrHtml(mergedForSsr);
  const lcpPreloadEntries = resolveHomeLcpPreloadEntries(weekEvents, todayKey);
  for (const entry of lcpPreloadEntries) {
    preload(entry.href, {
      as: "image",
      fetchPriority: "high",
    });
  }
  const tonightEvents = mergeFeedEvents(ssrEvents, weekEvents);
  const weekPresentation = buildWeekDestacadosPresentation(
    weekEvents,
    todayKey,
    FEED_DAY_COUNT
  );
  const destacadosEnhancer = resolveDestacadosEnhancerProps(weekEvents, todayKey);

  return (
    <>
      <HomeLcpPreload entries={lcpPreloadEntries} />
      <div className={`fh-body${weekPresentation.bodyClassSuffix}`}>
        <Nav />
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
              {!audit ? (
                <HomePageClientShell
                  adSlot={{
                    slot: "feed-mid",
                    className: "mx-auto max-w-[950px] px-5",
                  }}
                  hydration={{
                    initialEvents: ssrEvents,
                    initialDestacadosEvents: weekEvents,
                    initialWeekEvents: [],
                    initialError: error,
                    serverDayHeaderDate: initialDay?.date ?? null,
                    initialEventCount: ssrEvents.length,
                    tonightEvents,
                    todayKey,
                    destacadosEnhancer,
                  }}
                />
              ) : null}
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

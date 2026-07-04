import { preload } from "react-dom";
import { DestacadosSection } from "./DestacadosSection";
import { FeedControlsShell } from "./FeedControlsShell";
import { HomeFaq } from "./HomeFaq";
import { HomeFeedDayHeader } from "./HomeFeedDayHeader";
import { HomeFeedDayStatic } from "./HomeFeedDayStatic";
import { HomeJsonLd } from "./HomeJsonLd";
import { HomeLcpPreload } from "./HomeLcpPreload";
import { HomeNavStatic } from "./HomeNavStatic";
import { SeoGuidesPromo } from "./SeoGuidesPromo";
import { SiteFooter } from "./SiteFooter";
import { TonightForYouSectionStatic } from "./TonightForYouSectionStatic";
import { UfcDestacadosStatic } from "./UfcDestacadosStatic";
import { UfcHomeNav } from "./UfcHomeNav";
import { eventsForHomeSsrHtml } from "../lib/featured";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { HOME_SSR_DAY_COUNT } from "../lib/home-feed-config";
import { resolveHomeLcpPreloadEntries } from "../lib/home-lcp";
import { loadHomePageData } from "../lib/home-page-data";
import { mergeFeedEvents } from "../lib/merge-feed-events";
import { buildWeekDestacadosPresentation } from "../lib/destacados-week-present";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { isUfcWeekEditorialWindow, UFC_CASABLANCA_FALLBACK } from "../lib/ufc-week";

/**
 * Home 100 % SSR para PSI/Lighthouse — módulo aislado sin grafo cliente.
 * No importar HomeNav, HomePageClientShell, next/dynamic ni FeedHydrationGate.
 */
export async function HomeFeedPageAudit() {
  const initialDay = buildDisplayDays(MADRID_TZ, HOME_SSR_DAY_COUNT)[0];
  const todayKey = initialDay?.date ?? "";
  const ufcEditorial = isUfcWeekEditorialWindow(todayKey);
  const shellDays = buildDisplayDays(MADRID_TZ, HOME_SSR_DAY_COUNT);

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

  const { events, weekEvents } = await loadHomePageData();
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

  return (
    <>
      <HomeLcpPreload entries={lcpPreloadEntries} />
      <div className={`fh-body${weekPresentation.bodyClassSuffix}`}>
        <HomeNavStatic />
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

import type { Metadata } from "next";
import { preload } from "react-dom";
import { DestacadosSection } from "../components/DestacadosSection";
import { FeedErrorBoundary } from "../components/FeedErrorBoundary";
import { FeedControlsShell } from "../components/FeedControlsShell";
import { HomeFeedDayHeader } from "../components/HomeFeedDayHeader";
import { HomeFeed } from "../components/HomePage";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { HomeJsonLd } from "../components/HomeJsonLd";
import { HomeLcpPreload } from "../components/HomeLcpPreload";
import { HomeNav } from "../components/HomeNav";
import { HomeResetProvider } from "../components/HomeResetContext";
import { SiteFooter } from "../components/SiteFooter";
import { trimHomeSsrEvents } from "../lib/featured";
import {
  getDestacadosFeedEventsForPage,
  getHomeFeedEventsForPage,
} from "../lib/events-feed-server";
import { resolveHomeLcpPreloadEntries } from "../lib/home-lcp";
import { buildHomeMetadataTitle } from "../lib/seo-jsonld";
import { defaultDescription, pageMetadata, seoKeywords } from "../lib/seo";

export const revalidate = 900;

export function generateMetadata(): Metadata {
  return pageMetadata(
    "/",
    buildHomeMetadataTitle(),
    defaultDescription,
    seoKeywords
  );
}

export default async function Page() {
  const [{ events, error }, { events: weekEvents }] = await Promise.all([
    getHomeFeedEventsForPage(),
    getDestacadosFeedEventsForPage(),
  ]);
  const ssrEvents = trimHomeSsrEvents(events);
  const lcpPreloadEntries = resolveHomeLcpPreloadEntries(weekEvents);
  const initialDay = buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0];
  const displayDays = buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT);

  for (const entry of lcpPreloadEntries) {
    preload(entry.href, {
      as: "image",
      fetchPriority: "high",
      imageSrcSet: entry.imageSrcSet,
      imageSizes: entry.imageSizes,
    });
  }

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

              <FeedErrorBoundary>
                <DestacadosSection events={weekEvents} />
              </FeedErrorBoundary>

              <div className="qvh-home-feed-slot">
                <HomeFeed
                  initialEvents={ssrEvents}
                  initialDestacadosEvents={weekEvents}
                  initialError={error}
                  serverDayHeaderDate={initialDay?.date ?? null}
                  feedControlsShell={
                    <FeedControlsShell days={displayDays} />
                  }
                  dayHeader={
                    initialDay ? (
                      <HomeFeedDayHeader
                        date={initialDay.date}
                        title={initialDay.title}
                      />
                    ) : null
                  }
                />
              </div>
            </div>
            <SiteFooter />
          </main>
        </HomeResetProvider>
      </div>
    </>
  );
}

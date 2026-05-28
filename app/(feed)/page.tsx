import type { Metadata } from "next";
import { DestacadosSection } from "../components/DestacadosSection";
import { FeedErrorBoundary } from "../components/FeedErrorBoundary";
import { HomeFeed } from "../components/HomePage";
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
import { resolveHomeLcpPreloadUrl } from "../lib/home-lcp";
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
  const lcpPreload = resolveHomeLcpPreloadUrl(weekEvents);

  return (
    <>
      <HomeLcpPreload href={lcpPreload} />
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

              <HomeFeed
                initialEvents={ssrEvents}
                initialDestacadosEvents={weekEvents}
                initialError={error}
              />
              <SiteFooter />
            </div>
          </main>
        </HomeResetProvider>
      </div>
    </>
  );
}

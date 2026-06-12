import { getDestacadosFeedEventsForPage } from "../lib/events-feed-server";
import { mergeFeedEvents } from "../lib/merge-feed-events";
import { getHomeFeedEventsForPage } from "../lib/events-feed-server";
import { HomeJsonLd } from "./HomeJsonLd";

export async function UfcHomeJsonLdServer() {
  const [home, destacados] = await Promise.all([
    getHomeFeedEventsForPage(),
    getDestacadosFeedEventsForPage(),
  ]);
  const merged = mergeFeedEvents(home.events, destacados.events);
  return <HomeJsonLd events={merged.length > 0 ? merged : home.events} />;
}

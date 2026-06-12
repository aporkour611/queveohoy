import { getDestacadosFeedEventsForPage } from "../lib/events-feed-server";
import { DestacadosSection } from "./DestacadosSection";

export async function DestacadosSectionServer() {
  const { events } = await getDestacadosFeedEventsForPage();
  return <DestacadosSection events={events} />;
}

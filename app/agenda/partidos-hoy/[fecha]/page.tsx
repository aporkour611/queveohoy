import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoDatePage } from "../../../components/SeoDatePage";
import { getFeedEventsForPage } from "../../../lib/events-feed-server";
import {
  buildDateMetadataDescription,
  buildDateMetadataTitle,
  isBeyondRollingWindow,
  isIsoDateParam,
  isPastSeoDate,
  partidosHoyDatePath,
} from "../../../lib/seo-date";
import { pageMetadata } from "../../../lib/seo";

export const revalidate = 600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ fecha: string }>;
};

const DATE_KEYWORDS = [
  "partidos hoy",
  "partidos mañana",
  "agenda tv",
  "horarios partidos",
  "que partidos hay",
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { fecha } = await params;
  if (!isIsoDateParam(fecha) || isBeyondRollingWindow(fecha)) return {};

  const { events } = await getFeedEventsForPage();
  const path = partidosHoyDatePath(fecha);
  const base = pageMetadata(
    path,
    buildDateMetadataTitle(fecha),
    buildDateMetadataDescription(fecha, events),
    DATE_KEYWORDS
  );

  if (isPastSeoDate(fecha)) {
    return {
      ...base,
      robots: { index: false, follow: true },
    };
  }

  return base;
}

export default async function PartidosHoyDateRoute({ params }: PageProps) {
  const { fecha } = await params;
  if (!isIsoDateParam(fecha) || isBeyondRollingWindow(fecha)) {
    notFound();
  }

  const { events } = await getFeedEventsForPage();

  return <SeoDatePage dateKey={fecha} events={events} />;
}

import type { EventRow } from "../components/types";
import { displayTime } from "./madrid-time";
import { eventLabel } from "./seo-events";
import {
  buildDisplayDays,
  filterEventsInWeek,
  mapEventsToTimezone,
  MADRID_TZ,
} from "./timezone";
import { FEED_DAY_COUNT } from "./events-feed";
import { siteBrand, siteName, siteUrl } from "./seo";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function eventDescription(event: EventRow): string {
  const parts = [
    event.competition,
    event.time ? displayTime(event.time) : null,
    event.platform,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function buildRssXml(events: EventRow[]): string {
  const mapped = filterEventsInWeek(
    mapEventsToTimezone(events, MADRID_TZ),
    MADRID_TZ,
    FEED_DAY_COUNT
  ).slice(0, 60);

  const days = buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT);
  const now = new Date().toUTCString();

  const items = mapped
    .map((event) => {
      const day = days.find((d) => d.date === event.date);
      const title = `${eventLabel(event)}${day ? ` — ${day.label}` : ""}`;
      const link = `${siteUrl}/partidos-hoy/${event.date}`;
      const pubDate = event.date
        ? new Date(`${event.date}T12:00:00+01:00`).toUTCString()
        : now;
      const desc = eventDescription(event);

      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(`${siteUrl}/#event-${event.id}`)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(desc)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)} — partidos y TV hoy</title>
    <link>${siteUrl}</link>
    <description>Agenda diaria de partidos, deportes y estrenos con horario y canal en España.</description>
    <language>es-ES</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <copyright>© ${new Date().getFullYear()} ${escapeXml(siteBrand)}</copyright>
${items}
  </channel>
</rss>`;
}

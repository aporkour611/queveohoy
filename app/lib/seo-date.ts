import type { EventRow } from "../components/types";
import { displayTime } from "./madrid-time";
import { eventLabel } from "./seo-events";
import {
  dayTitleInZone,
  filterEventsInWeek,
  getWeekDatesInZone,
  mapEventsToTimezone,
  MADRID_TZ,
} from "./timezone";

/** Días futuros + hoy en sitemap y generateStaticParams. */
export const SEO_DATE_SITEMAP_DAYS = 14;

/** Enlaces visibles en hub partidos-hoy (evita nav enorme). */
export const SEO_DATE_NAV_DAYS = 7;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDateParam(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  );
}

export function getRollingSeoDateKeys(
  timeZone: string = MADRID_TZ,
  count: number = SEO_DATE_SITEMAP_DAYS
): string[] {
  return getWeekDatesInZone(timeZone, count);
}

export function getMadridTodayKey(timeZone: string = MADRID_TZ): string {
  return getWeekDatesInZone(timeZone, 1)[0];
}

export function isPastSeoDate(
  dateKey: string,
  timeZone: string = MADRID_TZ
): boolean {
  return dateKey < getMadridTodayKey(timeZone);
}

export function isBeyondRollingWindow(
  dateKey: string,
  timeZone: string = MADRID_TZ
): boolean {
  const rolling = getRollingSeoDateKeys(timeZone);
  return dateKey > rolling[rolling.length - 1];
}

export function dayOffsetFromToday(
  dateKey: string,
  timeZone: string = MADRID_TZ
): number {
  const today = getMadridTodayKey(timeZone);
  const rolling = getRollingSeoDateKeys(timeZone, SEO_DATE_SITEMAP_DAYS);
  const index = rolling.indexOf(dateKey);
  if (index >= 0) return index;
  const msPerDay = 86_400_000;
  const a = Date.parse(`${dateKey}T12:00:00Z`);
  const b = Date.parse(`${today}T12:00:00Z`);
  return Math.round((a - b) / msPerDay);
}

export function formatDateForMetadata(
  dateKey: string,
  timeZone: string = MADRID_TZ
): string {
  const offset = dayOffsetFromToday(dateKey, timeZone);
  return dayTitleInZone(dateKey, offset, timeZone);
}

export function filterEventsForDate(
  events: EventRow[],
  dateKey: string,
  timeZone: string = MADRID_TZ
): EventRow[] {
  const mapped = mapEventsToTimezone(events, timeZone);
  return mapped.filter((event) => event.date === dateKey);
}

export function buildDateMetadataTitle(dateKey: string): string {
  const label = formatDateForMetadata(dateKey);
  return `Partidos ${label} en TV`;
}

export function buildDateMetadataDescription(
  dateKey: string,
  events: EventRow[]
): string {
  const dayEvents = filterEventsForDate(events, dateKey).slice(0, 3);
  const label = formatDateForMetadata(dateKey);

  if (dayEvents.length === 0) {
    return `Partidos y eventos deportivos ${label} en TV y streaming: horarios y canales en España.`;
  }

  const samples = dayEvents
    .map((event) => {
      const parts = [
        eventLabel(event),
        event.time ? displayTime(event.time) : null,
        event.platform?.split(",")[0]?.trim(),
      ].filter(Boolean);
      return parts.join(" ");
    })
    .join(" · ");

  return `Partidos ${label} en TV: ${samples}. Horarios y canales en España.`;
}

export function buildDatePageLead(
  dateKey: string,
  events: EventRow[]
): string {
  const count = filterEventsForDate(events, dateKey).length;
  const label = formatDateForMetadata(dateKey);

  if (count === 0) {
    return `Agenda de partidos y deportes ${label} con horario y canal en España.`;
  }

  return `${count} eventos ${label} en TV y streaming: fútbol, Champions, F1, UFC y más con horario y canal.`;
}

/** Para IndexNow y sitemap. */
export function partidosHoyDatePath(dateKey: string): string {
  return `/partidos-hoy/${dateKey}`;
}

export function filterEventsInRollingWindow(
  events: EventRow[],
  timeZone: string = MADRID_TZ
): EventRow[] {
  return filterEventsInWeek(
    mapEventsToTimezone(events, timeZone),
    timeZone,
    SEO_DATE_SITEMAP_DAYS
  );
}

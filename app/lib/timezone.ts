import type { EventRow } from "../components/types";
import { MADRID_TZ, madridDateTimeToUtc } from "./madrid-time";

export { MADRID_TZ };

export function toDateKeyInZone(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function toTimeInZone(d: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

export function splitInstantToZone(
  d: Date,
  timeZone: string
): { date: string; time: string } {
  return {
    date: toDateKeyInZone(d, timeZone),
    time: toTimeInZone(d, timeZone),
  };
}

/** Eventos en BD con date/time en Europe/Madrid */
export function convertStoredMadridDateTime(
  dateKey: string,
  time: string,
  targetTimeZone: string
): { date: string; time: string } {
  if (targetTimeZone === MADRID_TZ) {
    return { date: dateKey, time: (time || "12:00").slice(0, 5) };
  }

  const utc = madridDateTimeToUtc(dateKey, time || "12:00");
  return splitInstantToZone(utc, targetTimeZone);
}

export function dateTimeInZoneToUtc(
  dateKey: string,
  time: string,
  timeZone: string
): Date {
  const [hStr, mStr] = time.split(":");
  const targetH = parseInt(hStr ?? "12", 10);
  const targetM = parseInt(mStr ?? "0", 10);
  const searchStart = Date.parse(`${dateKey}T00:00:00Z`) - 24 * 3_600_000;

  for (let t = searchStart; t < searchStart + 48 * 3_600_000; t += 60_000) {
    const d = new Date(t);
    if (toDateKeyInZone(d, timeZone) !== dateKey) continue;
    const [hh, mm] = toTimeInZone(d, timeZone).split(":").map(Number);
    if (hh === targetH && mm === targetM) return d;
  }

  return new Date(`${dateKey}T12:00:00Z`);
}

export function addDaysToDateKeyInZone(
  dateKey: string,
  days: number,
  timeZone: string
): string {
  const anchor = Date.parse(`${dateKey}T12:00:00Z`) + days * 86_400_000;
  return toDateKeyInZone(new Date(anchor), timeZone);
}

export function getWeekDatesInZone(timeZone: string, count = 7): string[] {
  const start = toDateKeyInZone(new Date(), timeZone);
  return Array.from({ length: count }, (_, i) =>
    addDaysToDateKeyInZone(start, i, timeZone)
  );
}

/** Rango de fechas en BD (Europe/Madrid) para la ventana del feed sin traer todo el histórico */
export function getEventsQueryDateRange(dayCount = 7): { from: string; to: string } {
  const madridToday = getWeekDatesInZone(MADRID_TZ, 1)[0];
  return {
    from: addDaysToDateKeyInZone(madridToday, -2, MADRID_TZ),
    to: addDaysToDateKeyInZone(madridToday, dayCount + 2, MADRID_TZ),
  };
}

export function dayNumber(dateKey: string): number {
  return parseInt(dateKey.split("-")[2], 10);
}

export function formatWeekdayInZone(
  dateKey: string,
  timeZone: string,
  style: "short" | "long" = "long"
): string {
  const d = dateTimeInZoneToUtc(dateKey, "12:00", timeZone);
  return d.toLocaleDateString("es-ES", { timeZone, weekday: style });
}

export function formatMonthShortInZone(dateKey: string, timeZone: string): string {
  const d = dateTimeInZoneToUtc(dateKey, "12:00", timeZone);
  return d
    .toLocaleDateString("es-ES", { timeZone, month: "short" })
    .replace(".", "");
}

export function dayTitleInZone(
  dateKey: string,
  offsetFromToday: number,
  timeZone: string
): string {
  const weekday = formatWeekdayInZone(dateKey, timeZone, "long");
  const month = dateTimeInZoneToUtc(dateKey, "12:00", timeZone).toLocaleDateString(
    "es-ES",
    { timeZone, month: "long" }
  );
  const day = dayNumber(dateKey);

  if (offsetFromToday === 0) return `Hoy ${weekday}, ${day} de ${month}`;
  if (offsetFromToday === 1) return `Mañana ${weekday}, ${day} de ${month}`;
  return `${weekday}, ${day} de ${month}`;
}

export function formatDisplayDateLabel(dateKey: string, timeZone: string): string {
  const week = getWeekDatesInZone(timeZone, 2);
  if (dateKey === week[0]) return "Hoy";
  if (dateKey === week[1]) return "Mañana";

  const weekday = formatWeekdayInZone(dateKey, timeZone, "short");
  const month = formatMonthShortInZone(dateKey, timeZone);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1, 3)} ${dayNumber(dateKey)} ${month}`;
}

export function mapEventsToTimezone(
  events: EventRow[],
  timeZone: string
): EventRow[] {
  if (timeZone === MADRID_TZ) return events;

  return events.map((event) => {
    if (!event.date) return event;
    const { date, time } = convertStoredMadridDateTime(
      event.date,
      event.time || "12:00",
      timeZone
    );
    return { ...event, date, time };
  });
}

export function filterEventsInWeek(
  events: EventRow[],
  timeZone: string,
  dayCount = 7
): EventRow[] {
  const allowed = new Set(getWeekDatesInZone(timeZone, dayCount));
  return events.filter((event) => event.date && allowed.has(event.date));
}

export function buildDisplayDays(timeZone: string, count = 7) {
  const dates = getWeekDatesInZone(timeZone, count);

  return dates.map((date, i) => {
    const weekday = formatWeekdayInZone(date, timeZone, "short");
    const month = formatMonthShortInZone(date, timeZone);
    return {
      label:
        i === 0
          ? "Hoy"
          : i === 1
            ? "Mañana"
            : weekday.charAt(0).toUpperCase() + weekday.slice(1, 3),
      date,
      num: dayNumber(date),
      month: month.charAt(0).toUpperCase() + month.slice(1),
      dayOffset: i,
      title: dayTitleInZone(date, i, timeZone),
    };
  });
}

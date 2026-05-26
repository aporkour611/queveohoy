/** Horario oficial de la app: península y Baleares (Europe/Madrid) */

export const MADRID_TZ = "Europe/Madrid";

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: MADRID_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toMadridDateKey(d: Date): string {
  return dateFmt.format(d);
}

export function toMadridTime(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MADRID_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

export function splitToMadrid(d: Date): { date: string; time: string } {
  return { date: toMadridDateKey(d), time: toMadridTime(d) };
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const anchor = Date.parse(`${dateKey}T12:00:00Z`) + days * 86_400_000;
  return toMadridDateKey(new Date(anchor));
}

export function getMadridWeekDates(count = 7): string[] {
  const start = toMadridDateKey(new Date());
  return Array.from({ length: count }, (_, i) => addDaysToDateKey(start, i));
}

/** Instantáneo UTC equivalente a una fecha/hora en Madrid */
export function madridDateTimeToUtc(dateKey: string, time: string): Date {
  const [hStr, mStr] = time.split(":");
  const targetH = parseInt(hStr ?? "12", 10);
  const targetM = parseInt(mStr ?? "0", 10);

  const searchStart = Date.parse(`${dateKey}T00:00:00Z`) - 24 * 3_600_000;

  for (let t = searchStart; t < searchStart + 48 * 3_600_000; t += 60_000) {
    const d = new Date(t);
    if (toMadridDateKey(d) !== dateKey) continue;
    const [hh, mm] = toMadridTime(d).split(":").map(Number);
    if (hh === targetH && mm === targetM) return d;
  }

  return new Date(`${dateKey}T12:00:00Z`);
}

export function madridWeekUtcRange(dayCount = 7): {
  dates: string[];
  from: string;
  to: string;
} {
  const dates = getMadridWeekDates(dayCount);
  const from = madridDateTimeToUtc(dates[0], "00:00").toISOString();
  const last = dates[dates.length - 1];
  const endDay = madridDateTimeToUtc(last, "23:59");
  endDay.setUTCSeconds(59, 999);
  return { dates, from, to: endDay.toISOString() };
}

export function parseUtcIso(iso: string): Date {
  return new Date(iso);
}

/** F1/Ergast: date + time UTC → Madrid */
export function ergastToMadrid(date: string, time?: string | null): {
  date: string;
  time: string;
} {
  const t = time?.includes("T") ? time : `${date}T${time || "12:00:00Z"}`;
  const normalized = t.endsWith("Z") || t.includes("+") ? t : `${t}Z`;
  return splitToMadrid(new Date(normalized));
}

export function formatMadridWeekday(dateKey: string, style: "short" | "long" = "long"): string {
  const d = madridDateTimeToUtc(dateKey, "12:00");
  return d.toLocaleDateString("es-ES", {
    timeZone: MADRID_TZ,
    weekday: style,
  });
}

export function formatMadridMonthShort(dateKey: string): string {
  const d = madridDateTimeToUtc(dateKey, "12:00");
  return d
    .toLocaleDateString("es-ES", { timeZone: MADRID_TZ, month: "short" })
    .replace(".", "");
}

export function madridDayNumber(dateKey: string): number {
  return parseInt(dateKey.split("-")[2], 10);
}

export function madridDayTitle(dateKey: string, offsetFromToday: number): string {
  const d = madridDateTimeToUtc(dateKey, "12:00");
  const weekday = d.toLocaleDateString("es-ES", {
    timeZone: MADRID_TZ,
    weekday: "long",
  });
  const month = d.toLocaleDateString("es-ES", {
    timeZone: MADRID_TZ,
    month: "long",
  });
  const day = madridDayNumber(dateKey);

  if (offsetFromToday === 0) return `Hoy ${weekday}, ${day} de ${month}`;
  if (offsetFromToday === 1) return `Mañana ${weekday}, ${day} de ${month}`;
  return `${weekday}, ${day} de ${month}`;
}

export function formatEventDayShort(dateKey: string): string {
  const weekday = formatMadridWeekday(dateKey, "short");
  const month = formatMadridMonthShort(dateKey);
  const day = madridDayNumber(dateKey);
  return `${weekday} ${day} ${month.toLowerCase()}`;
}

export function formatUpcomingSectionDate(dateKey: string): string {
  const weekday = formatMadridWeekday(dateKey, "long");
  const d = madridDateTimeToUtc(dateKey, "12:00");
  const month = d.toLocaleDateString("es-ES", {
    timeZone: MADRID_TZ,
    month: "long",
  });
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
  const day = madridDayNumber(dateKey);
  return `${weekday}, ${day} de ${monthCap}`;
}

export function formatUpcomingBadge(
  eventDate: string,
  selectedDate: string,
  todayDate: string
): string {
  const when = formatEventDayShort(eventDate);
  if (selectedDate === todayDate) {
    return `Próximo · ${when} · no es hoy`;
  }
  return `Próximo · ${when}`;
}

/** Normaliza hora guardada (HH:mm o HH:mm:ss) */
export function displayTime(time?: string | null): string {
  if (!time?.trim()) return "—";
  return time.slice(0, 5);
}

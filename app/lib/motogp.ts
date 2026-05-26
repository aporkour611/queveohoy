import {
  getMadridWeekDates,
  parseUtcIso,
  splitToMadrid,
  toMadridDateKey,
} from "./madrid-time";

const API_BASE = "https://api.motogp.pulselive.com/motogp/v1/results";

/** PulseLive — API pública de MotoGP, sin key (usada por importadores open source). */
export type MotogpCronEvent = {
  external_id: string;
  title: string;
  date: string;
  time: string;
  sport: "motos";
  category: "deportes";
  competition: string;
  platform: string;
  source: string;
};

type Season = { id: string; year: number; current?: boolean };
type Category = { id: string; name?: string };
type GrandPrix = {
  id: string;
  name?: string;
  sponsored_name?: string;
  test?: boolean;
  status?: string;
  date_start?: string;
  date_end?: string;
  circuit?: { name?: string; place?: string; nation?: string };
  country?: { name?: string };
};
type Session = {
  id: string;
  type?: string;
  date?: string;
  status?: string;
  event?: { id?: string; name?: string; sponsored_name?: string; test?: boolean };
};

const SESSION_LABELS: Record<string, string> = {
  RAC: "Carrera",
  Q: "Clasificación",
  SPR: "Sprint",
  FP: "Entrenos",
  PR: "Press",
  WUP: "Warm-up",
};

function encodeMotogpSource(sessionType: string, eventId: string): string {
  return `motogp:${eventId}:${sessionType}`;
}

function sessionLabel(type?: string): string {
  return SESSION_LABELS[type ?? ""] ?? type ?? "Sesión";
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

async function getCurrentSeasonId(): Promise<string | null> {
  const seasons = await fetchJson<Season[]>(`${API_BASE}/seasons`);
  const current =
    seasons?.find((season) => season.current) ??
    seasons?.find((season) => season.year === new Date().getFullYear());
  return current?.id ?? null;
}

async function getMotogpCategoryId(seasonId: string): Promise<string | null> {
  const categories = await fetchJson<Category[]>(
    `${API_BASE}/categories?seasonUuid=${seasonId}`
  );
  return categories?.find((cat) => /motogp/i.test(cat.name ?? ""))?.id ?? null;
}

function normalizeSession(
  session: Session,
  weekDates: string[]
): MotogpCronEvent | null {
  if (!session.id || !session.date || !session.event?.id) return null;
  if (session.event.test) return null;
  if (session.status === "FINISHED") return null;
  if (!["RAC", "SPR", "Q"].includes(session.type ?? "")) return null;

  const { date, time } = splitToMadrid(parseUtcIso(session.date));
  const today = toMadridDateKey(new Date());
  const weekEnd = weekDates[weekDates.length - 1];
  if (date < today || date > weekEnd) return null;

  const gpName =
    session.event.sponsored_name?.trim() ||
    session.event.name?.trim() ||
    "Gran Premio";
  const label = sessionLabel(session.type);

  return {
    external_id: `motogp_${session.id}`,
    title: `MotoGP ${label} — ${gpName}`,
    date,
    time,
    sport: "motos",
    category: "deportes",
    competition: "MotoGP",
    platform: "DAZN, Movistar+",
    source: encodeMotogpSource(session.type ?? "RAC", session.event.id),
  };
}

export async function fetchMotogpCronEvents(
  dayCount = 7
): Promise<MotogpCronEvent[]> {
  const weekDates = getMadridWeekDates(dayCount);
  const seasonId = await getCurrentSeasonId();
  if (!seasonId) return [];

  const categoryId = await getMotogpCategoryId(seasonId);
  if (!categoryId) return [];

  const grandPrix = await fetchJson<GrandPrix[]>(
    `${API_BASE}/events?seasonUuid=${seasonId}&categoryUuid=${categoryId}`
  );

  const upcoming = (grandPrix ?? []).filter(
    (event) => !event.test && event.status !== "FINISHED"
  );

  const sessionLists = await Promise.all(
    upcoming.slice(0, 8).map((event) =>
      fetchJson<Session[]>(
        `${API_BASE}/sessions?eventUuid=${event.id}&categoryUuid=${categoryId}`
      )
    )
  );

  const map = new Map<string, MotogpCronEvent>();
  for (const sessions of sessionLists) {
    for (const session of sessions ?? []) {
      const event = normalizeSession(session, weekDates);
      if (event) map.set(event.external_id, event);
    }
  }

  return [...map.values()].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "")
  );
}

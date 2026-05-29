import type { EventRow } from "../components/types";
import {
  eventCanDisplay,
  filterEventsForDisplay,
  filterPublishableEvents,
} from "./event-crests";
import { eventMatchesSportFilters } from "./tv-show-category";
import {
  HOME_DAILY_EVENT_CAP,
  HOME_UPCOMING_MIN,
} from "./home-feed-config";
import {
  pickFeaturedEvents,
  pickFilteredEvents,
  pickHomePageEvents,
  pickUpcomingFeaturedEvents,
  pickUpcomingFilteredEvents,
  eventPriority,
} from "./featured";

type UpcomingResult = {
  events: EventRow[];
  isUpcoming: boolean;
  message: string | null;
};

export function resolveVisibleEvents(
  allEvents: EventRow[],
  dayEvents: EventRow[],
  selectedDate: string,
  todayDate: string,
  selectedSports: string[],
  isFeaturedMode: boolean
): UpcomingResult {
  const crestedAll = filterEventsForDisplay(allEvents);
  const crestedDay = filterEventsForDisplay(dayEvents);

  if (isFeaturedMode) {
    const featuredToday = pickFeaturedEvents(crestedDay);
    if (featuredToday.length > 0) {
      return {
        events: featuredToday,
        isUpcoming: false,
        message: null,
      };
    }

    const upcomingFeatured = pickUpcomingFeaturedEvents(crestedAll, selectedDate);
    if (upcomingFeatured.length === 0) {
      return { events: [], isUpcoming: false, message: null };
    }

    const isToday = selectedDate === todayDate;
    return {
      events: upcomingFeatured,
      isUpcoming: true,
      message: isToday
        ? "No hay destacados hoy. Próximos eventos importantes:"
        : "No hay destacados este día. Próximos eventos importantes:",
    };
  }

  const forDay = pickFilteredEvents(
    filterPublishableEvents(dayEvents).filter((e) =>
      eventMatchesSportFilters(e, selectedSports)
    )
  );

  if (forDay.length > 0) {
    return { events: forDay, isUpcoming: false, message: null };
  }

  const upcoming = pickUpcomingFilteredEvents(
    filterPublishableEvents(allEvents).filter(
      (e) =>
        eventMatchesSportFilters(e, selectedSports) &&
        e.date &&
        e.date > selectedDate
    )
  );

  if (upcoming.length === 0) {
    return { events: [], isUpcoming: false, message: null };
  }

  const isToday = selectedDate === todayDate;

  return {
    events: upcoming,
    isUpcoming: true,
    message: isToday
      ? "No hay eventos de esta categoría hoy. Estos son los próximos:"
      : `No hay eventos este día. Próximos en calendario:`,
  };
}

function sortDayEvents(events: EventRow[]): EventRow[] {
  return [...events].sort(
    (a, b) =>
      (a.time ?? "").localeCompare(b.time ?? "") ||
      eventPriority(b) - eventPriority(a)
  );
}

/** Semana completa: todos los eventos del día (sin recorte de portada). */
export function resolveDayEventsAllFromIndex(
  byDate: Map<string, EventRow[]>,
  date: string,
  selectedSports: Set<string>,
  isFeaturedMode: boolean
): EventRow[] {
  let dayEvents = byDate.get(date) ?? [];

  if (isFeaturedMode) {
    return pickHomePageEvents(dayEvents.filter(eventCanDisplay));
  }

  if (selectedSports.size > 0) {
    dayEvents = dayEvents.filter((event) =>
      eventMatchesSportFilters(event, selectedSports)
    );
  }

  return sortDayEvents(dayEvents);
}

/** Un día en el feed continuo (sin saltar a días futuros dentro del mismo bloque) */
export function resolveDayEventsForFeed(
  allEvents: EventRow[],
  date: string,
  selectedSports: string[],
  isFeaturedMode: boolean
): EventRow[] {
  const dayEvents = filterPublishableEvents(allEvents).filter((e) => e.date === date);

  if (isFeaturedMode) {
    return pickHomePageEvents(dayEvents.filter(eventCanDisplay));
  }

  return pickFilteredEvents(
    dayEvents.filter((e) => eventMatchesSportFilters(e, selectedSports))
  );
}

/** Indexa eventos publicables por fecha (el recorte de destacados se aplica al renderizar). */
export function indexDisplayEventsByDate(
  events: EventRow[]
): Map<string, EventRow[]> {
  const byDate = new Map<string, EventRow[]>();

  for (const event of filterPublishableEvents(events)) {
    if (!event.date) continue;
    const list = byDate.get(event.date);
    if (list) list.push(event);
    else byDate.set(event.date, [event]);
  }

  return byDate;
}

export function resolveDayEventsFromIndex(
  byDate: Map<string, EventRow[]>,
  date: string,
  selectedSports: Set<string>,
  isFeaturedMode: boolean
): EventRow[] {
  const dayEvents = byDate.get(date) ?? [];

  if (isFeaturedMode) {
    return pickHomePageEvents(dayEvents.filter(eventCanDisplay));
  }

  if (selectedSports.size === 0) {
    return pickHomePageEvents(dayEvents);
  }

  return pickFilteredEvents(
    dayEvents.filter((e) => eventMatchesSportFilters(e, selectedSports))
  );
}

export type HomeDayEventsResult = {
  todayEvents: EventRow[];
  upcomingEvents: EventRow[];
  upcomingMessage: string | null;
};

const featuredHomeDayCache = new WeakMap<
  Map<string, EventRow[]>,
  Map<string, HomeDayEventsResult>
>();

function featuredHomeDayCacheKey(date: string, todayKey: string): string {
  return `${date}\0${todayKey}`;
}

/** Igual que resolveHomeDayEvents, pero memoriza la vista destacada por índice de fechas. */
export function resolveFeaturedHomeDayEvents(
  byDate: Map<string, EventRow[]>,
  date: string,
  todayKey: string
): HomeDayEventsResult {
  let dayCache = featuredHomeDayCache.get(byDate);
  if (!dayCache) {
    dayCache = new Map();
    featuredHomeDayCache.set(byDate, dayCache);
  }

  const key = featuredHomeDayCacheKey(date, todayKey);
  const cached = dayCache.get(key);
  if (cached) return cached;

  const result = resolveHomeDayEvents(byDate, date, todayKey, new Set(), true);
  dayCache.set(key, result);
  return result;
}

/** Vista Hoy: si el día tiene pocos eventos, añade los próximos de la semana. */
export function resolveHomeDayEvents(
  byDate: Map<string, EventRow[]>,
  date: string,
  todayKey: string,
  selectedSports: Set<string>,
  isFeaturedMode: boolean
): HomeDayEventsResult {
  const todayEvents = resolveDayEventsFromIndex(
    byDate,
    date,
    selectedSports,
    isFeaturedMode
  );

  if (
    !isFeaturedMode ||
    selectedSports.size > 0 ||
    date !== todayKey ||
    todayEvents.length >= HOME_UPCOMING_MIN
  ) {
    return {
      todayEvents,
      upcomingEvents: [],
      upcomingMessage: null,
    };
  }

  const seen = new Set(todayEvents.map((event) => event.id));
  const upcomingEvents: EventRow[] = [];
  const futureDates = [...byDate.keys()].filter((d) => d > date).sort();

  for (const futureDate of futureDates) {
    for (const event of resolveDayEventsFromIndex(
      byDate,
      futureDate,
      selectedSports,
      true
    )) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      upcomingEvents.push(event);
      if (todayEvents.length + upcomingEvents.length >= HOME_UPCOMING_MIN) break;
    }
    if (todayEvents.length + upcomingEvents.length >= HOME_DAILY_EVENT_CAP) break;
  }

  if (upcomingEvents.length === 0) {
    return {
      todayEvents,
      upcomingEvents: [],
      upcomingMessage: null,
    };
  }

  return {
    todayEvents,
    upcomingEvents,
    upcomingMessage: "Próximos eventos destacados:",
  };
}

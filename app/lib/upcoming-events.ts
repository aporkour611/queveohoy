import type { EventRow } from "../components/types";
import { filterEventsForDisplay } from "./event-crests";
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
    crestedDay.filter((e) => eventMatchesSportFilters(e, selectedSports))
  );

  if (forDay.length > 0) {
    return { events: forDay, isUpcoming: false, message: null };
  }

  const upcoming = pickUpcomingFilteredEvents(
    crestedAll.filter(
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

/** Un día en el feed continuo (sin saltar a días futuros dentro del mismo bloque) */
export function resolveDayEventsForFeed(
  allEvents: EventRow[],
  date: string,
  selectedSports: string[],
  isFeaturedMode: boolean
): EventRow[] {
  const dayEvents = filterEventsForDisplay(allEvents).filter((e) => e.date === date);

  if (isFeaturedMode) {
    return pickHomePageEvents(dayEvents);
  }

  return pickFilteredEvents(
    dayEvents.filter((e) => eventMatchesSportFilters(e, selectedSports))
  );
}

/** Indexa eventos visibles por fecha (una sola pasada). */
export function indexDisplayEventsByDate(
  events: EventRow[]
): Map<string, EventRow[]> {
  const byDate = new Map<string, EventRow[]>();

  for (const event of filterEventsForDisplay(events)) {
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
    return pickHomePageEvents(dayEvents);
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

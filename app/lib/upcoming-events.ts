import type { EventRow } from "../components/types";
import { filterEventsForDisplay } from "./event-crests";
import {
  pickFeaturedEvents,
  pickFilteredEvents,
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
    crestedDay.filter((e) => selectedSports.includes(e.sport ?? ""))
  );

  if (forDay.length > 0) {
    return { events: forDay, isUpcoming: false, message: null };
  }

  const upcoming = pickUpcomingFilteredEvents(
    crestedAll.filter(
      (e) =>
        selectedSports.includes(e.sport ?? "") &&
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
    return pickFeaturedEvents(dayEvents);
  }

  return pickFilteredEvents(
    dayEvents.filter((e) => selectedSports.includes(e.sport ?? ""))
  );
}

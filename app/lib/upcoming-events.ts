import type { EventRow } from "../components/types";
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
  if (isFeaturedMode) {
    const featuredToday = pickFeaturedEvents(dayEvents);
    if (featuredToday.length > 0) {
      return {
        events: featuredToday,
        isUpcoming: false,
        message: null,
      };
    }

    const upcomingFeatured = pickUpcomingFeaturedEvents(allEvents, selectedDate);
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
    dayEvents.filter((e) => selectedSports.includes(e.sport ?? ""))
  );

  if (forDay.length > 0) {
    return { events: forDay, isUpcoming: false, message: null };
  }

  const upcoming = pickUpcomingFilteredEvents(
    allEvents.filter(
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

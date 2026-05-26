import type { EventRow } from "../components/types";

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
  isFeaturedMode: boolean,
  pickFeatured: (events: EventRow[]) => EventRow[]
): UpcomingResult {
  if (isFeaturedMode) {
    return {
      events: pickFeatured(dayEvents),
      isUpcoming: false,
      message: null,
    };
  }

  const forDay = dayEvents.filter((e) =>
    selectedSports.includes(e.sport ?? "")
  );

  if (forDay.length > 0) {
    return { events: forDay, isUpcoming: false, message: null };
  }

  const upcoming = allEvents
    .filter(
      (e) =>
        selectedSports.includes(e.sport ?? "") &&
        e.date &&
        e.date > selectedDate
    )
    .sort(
      (a, b) =>
        (a.date ?? "").localeCompare(b.date ?? "") ||
        (a.time ?? "").localeCompare(b.time ?? "")
    );

  if (upcoming.length === 0) {
    return { events: [], isUpcoming: false, message: null };
  }

  const isToday = selectedDate === todayDate;
  const labels = selectedSports.map((s) => s).join(", ");

  return {
    events: upcoming,
    isUpcoming: true,
    message: isToday
      ? "No hay eventos de esta categoría hoy. Estos son los próximos:"
      : `No hay eventos este día. Próximos en calendario:`,
  };
}

export function upcomingDateLabel(
  eventDate: string,
  selectedDate: string
): string | null {
  if (eventDate === selectedDate) return null;
  return eventDate;
}

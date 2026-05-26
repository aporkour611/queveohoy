import type { EventRow } from "../components/types";
import { displayTime } from "./madrid-time";
import {
  buildDisplayDays,
  filterEventsInWeek,
  mapEventsToTimezone,
  MADRID_TZ,
} from "./timezone";
import { FEED_DAY_COUNT } from "./events-feed";
import { eventLabel } from "./seo-events";

export type SeoHubConfig = {
  slug: string;
  title: string;
  h1: string;
  lead: string;
  description: string;
  keywords: string[];
  priority: number;
  dayScope: "today" | "week";
  match: (event: EventRow) => boolean;
};

function compMatches(event: EventRow, pattern: RegExp): boolean {
  return pattern.test(event.competition ?? "");
}

export const SEO_HUBS: SeoHubConfig[] = [
  {
    slug: "partidos-hoy",
    title: "Partidos hoy en TV",
    h1: "Partidos hoy en la tele",
    lead: "Todos los partidos y eventos deportivos de hoy con horario y canal en España.",
    description:
      "Partidos hoy en la tele: horarios y canales de fútbol, Champions, LaLiga, F1, UFC, baloncesto y más en España.",
    keywords: ["partidos hoy", "partidos hoy tv", "partidos hoy en la tele", "que partidos hay hoy"],
    priority: 0.95,
    dayScope: "today",
    match: () => true,
  },
  {
    slug: "futbol",
    title: "Fútbol hoy en TV",
    h1: "Fútbol hoy en la tele y streaming",
    lead: "Partidos de fútbol de la semana con horario y canal: LaLiga, Champions, copas y ligas internacionales.",
    description:
      "Qué partidos de fútbol hay hoy y esta semana en TV y streaming. Horarios y canales en España.",
    keywords: ["futbol hoy tv", "partidos futbol hoy", "fútbol hoy en la tele", "partidos de futbol hoy"],
    priority: 0.9,
    dayScope: "week",
    match: (e) => e.sport === "futbol",
  },
  {
    slug: "champions",
    title: "Champions League hoy",
    h1: "Champions League hoy en TV",
    lead: "Partidos de la Champions League con horario y canal: La 1, Movistar, DAZN y más.",
    description:
      "Champions League hoy: horarios y canales para ver la Champions en TV y streaming en España.",
    keywords: ["champions hoy", "champions league hoy tv", "champions hoy horario", "champions league canal"],
    priority: 0.9,
    dayScope: "week",
    match: (e) => e.sport === "futbol" && compMatches(e, /champions/i),
  },
  {
    slug: "laliga",
    title: "LaLiga hoy en TV",
    h1: "LaLiga hoy en la tele",
    lead: "Partidos de LaLiga EA Sports con horario y canal: Movistar, DAZN LaLiga y más.",
    description:
      "LaLiga hoy: horarios y canales de los partidos de Primera División en TV y streaming en España.",
    keywords: ["laliga hoy", "laliga hoy tv", "partidos laliga hoy", "primera division hoy tv"],
    priority: 0.9,
    dayScope: "week",
    match: (e) =>
      e.sport === "futbol" &&
      compMatches(e, /laliga|primera\s*divisi|division\s*de\s*honor/i),
  },
  {
    slug: "premier-league",
    title: "Premier League hoy",
    h1: "Premier League hoy en TV",
    lead: "Partidos de la Premier League inglesa con horario y canal en España.",
    description:
      "Premier League hoy: horarios y canales para ver la liga inglesa en TV y streaming.",
    keywords: ["premier league hoy", "premier hoy tv", "premier league horario", "premier league canal"],
    priority: 0.85,
    dayScope: "week",
    match: (e) => e.sport === "futbol" && compMatches(e, /premier/i),
  },
  {
    slug: "formula-1",
    title: "Fórmula 1 hoy",
    h1: "Fórmula 1 hoy en TV",
    lead: "Grandes Premios de F1 con horario y canal: Movistar, DAZN F1 y más.",
    description:
      "Fórmula 1 hoy: horarios y canales de los GPs de F1 en TV y streaming en España.",
    keywords: ["formula 1 hoy", "f1 hoy tv", "f1 horario", "grandes premios f1 canal"],
    priority: 0.85,
    dayScope: "week",
    match: (e) => e.sport === "formula1",
  },
  {
    slug: "motogp",
    title: "MotoGP hoy",
    h1: "MotoGP hoy en la tele",
    lead: "Carreras de MotoGP con horario y canal en TV y streaming.",
    description:
      "MotoGP hoy: horarios y canales para ver las carreras de motos en España.",
    keywords: ["motogp hoy", "motogp hoy tv", "motos hoy horario", "motogp canal"],
    priority: 0.8,
    dayScope: "week",
    match: (e) => e.sport === "motos",
  },
  {
    slug: "ufc",
    title: "UFC hoy",
    h1: "UFC hoy en TV",
    lead: "Peleas y eventos de UFC con horario y plataforma en España.",
    description:
      "UFC hoy: horarios y dónde ver las peleas de UFC en TV y streaming en España.",
    keywords: ["ufc hoy", "ufc hoy tv", "ufc horario", "peleas ufc hoy"],
    priority: 0.85,
    dayScope: "week",
    match: (e) => e.sport === "ufc",
  },
  {
    slug: "baloncesto",
    title: "Baloncesto hoy en TV",
    h1: "Baloncesto hoy en la tele",
    lead: "Partidos de baloncesto y NBA con horario y canal.",
    description:
      "Baloncesto hoy: horarios y canales de partidos de baloncesto y NBA en TV y streaming.",
    keywords: ["baloncesto hoy tv", "nba hoy horario", "partidos baloncesto hoy"],
    priority: 0.8,
    dayScope: "week",
    match: (e) => e.sport === "basket",
  },
  {
    slug: "series",
    title: "Series y estrenos hoy",
    h1: "Series y estrenos hoy en TV",
    lead: "Estrenos de series y capítulos nuevos con horario y plataforma.",
    description:
      "Series hoy: estrenos y capítulos nuevos con horario y dónde verlos en TV y streaming.",
    keywords: ["series hoy", "estrenos series hoy", "capitulos nuevos hoy", "series hoy tv"],
    priority: 0.75,
    dayScope: "week",
    match: (e) => e.sport === "series" || e.sport === "cine",
  },
];

export function getSeoHub(slug: string): SeoHubConfig | undefined {
  return SEO_HUBS.find((h) => h.slug === slug);
}

export function filterEventsForHub(
  events: EventRow[],
  hub: SeoHubConfig
): EventRow[] {
  const mapped = filterEventsInWeek(
    mapEventsToTimezone(events, MADRID_TZ),
    MADRID_TZ,
    hub.dayScope === "today" ? 1 : FEED_DAY_COUNT
  ).filter(hub.match);

  if (hub.dayScope === "today") {
    const todayKey = buildDisplayDays(MADRID_TZ, 1)[0]?.date;
    if (!todayKey) return mapped;
    return mapped.filter((e) => e.date === todayKey);
  }

  return mapped;
}

export function buildHubMetadataDescription(
  hub: SeoHubConfig,
  events: EventRow[]
): string {
  const filtered = filterEventsForHub(events, hub);
  const samples = filtered.slice(0, 3).map((event) => {
    const label = eventLabel(event);
    const time = event.time ? displayTime(event.time) : "";
    const channel = event.platform?.split(",")[0]?.trim();
    return [label, time, channel].filter(Boolean).join(" ");
  });

  if (samples.length === 0) {
    return hub.description;
  }

  return `${hub.description} Hoy: ${samples.join(" · ")}.`;
}

export function buildHubMetadataTitle(hub: SeoHubConfig): string {
  const today = new Date().toLocaleDateString("es-ES", {
    timeZone: MADRID_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (hub.slug === "partidos-hoy") {
    return `Partidos hoy ${today} en TV`;
  }

  return `${hub.title} — ${today}`;
}

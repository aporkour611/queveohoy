import type { EventRow } from "../components/types";
import { displayTime } from "./madrid-time";
import {
  buildDisplayDays,
  filterEventsInWeek,
  mapEventsToTimezone,
  MADRID_TZ,
} from "./timezone";
import { FEED_DAY_COUNT } from "./events-feed";
import {
  defaultDescription,
  homeTitle,
  siteBrand,
  siteName,
  siteUrl,
} from "./seo";

function eventLabel(event: EventRow): string {
  if (event.home_team && event.away_team) {
    return `${event.home_team} vs ${event.away_team}`;
  }
  return event.title?.trim() || "Evento";
}

function eventStartIso(date?: string, time?: string): string | undefined {
  if (!date) return undefined;
  const t = (time || "12:00").slice(0, 5);
  return `${date}T${t}:00`;
}

function buildSportsEvent(event: EventRow, index: number) {
  const name = eventLabel(event);
  const startDate = eventStartIso(event.date, event.time);

  return {
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "SportsEvent",
      name,
      description: [event.competition, event.platform].filter(Boolean).join(" · "),
      ...(startDate
        ? {
            startDate,
            eventStatus: "https://schema.org/EventScheduled",
          }
        : {}),
      organizer: {
        "@type": "Organization",
        name: event.platform || event.competition || siteBrand,
      },
    },
  };
}

export function buildHomeJsonLd(events: EventRow[]) {
  const madridEvents = filterEventsInWeek(
    mapEventsToTimezone(events, MADRID_TZ),
    MADRID_TZ,
    FEED_DAY_COUNT
  ).slice(0, 24);

  const itemList =
    madridEvents.length > 0
      ? {
          "@type": "ItemList",
          "@id": `${siteUrl}/#events`,
          name: "Qué ver hoy en la tele",
          numberOfItems: madridEvents.length,
          itemListElement: madridEvents.map(buildSportsEvent),
        }
      : null;

  const faq = {
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué ver hoy en la tele?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "En queveohoy.es puedes consultar partidos de fútbol, Champions, LaLiga, F1, MotoGP, UFC, baloncesto, tenis, series y estrenos con horario y canal en España.",
        },
      },
      {
        "@type": "Question",
        name: "¿Dónde ver el fútbol hoy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La agenda de queveohoy.es indica el canal o plataforma de cada partido: DAZN, Movistar, LaLiga TV, Gol Play, Telecinco, Antena 3 y más.",
        },
      },
      {
        "@type": "Question",
        name: "¿A qué hora son los partidos de hoy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Todos los horarios están en península y Baleares (Europe/Madrid). También puedes cambiar la zona horaria para LATAM desde la home.",
        },
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteBrand,
        url: siteUrl,
        logo: `${siteUrl}/logo-queveohoy.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        alternateName: ["que veo hoy", "qué ver hoy", "queveohoy", "qué ver hoy en la tele"],
        url: siteUrl,
        description: defaultDescription,
        inLanguage: "es-ES",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: homeTitle,
        description: defaultDescription,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: {
          "@type": "Thing",
          name: "Programación deportiva y entretenimiento en televisión",
        },
        inLanguage: "es-ES",
      },
      faq,
      ...(itemList ? [itemList] : []),
    ],
  };
}

export function buildHomeMetadataDescription(events: EventRow[]): string {
  const todayKey = buildDisplayDays(MADRID_TZ, 1)[0]?.date;
  const todayEvents = filterEventsInWeek(
    mapEventsToTimezone(events, MADRID_TZ),
    MADRID_TZ,
    1
  ).slice(0, 3);

  if (todayEvents.length === 0) {
    return defaultDescription;
  }

  const samples = todayEvents
    .map((event) => {
      const label = eventLabel(event);
      const time = event.time ? displayTime(event.time) : "";
      const channel = event.platform?.split(",")[0]?.trim();
      return [label, time, channel].filter(Boolean).join(" ");
    })
    .join(" · ");

  return `Qué ver hoy en TV: ${samples}. Fútbol, Champions, deportes y series con horarios y canales en España.`;
}

export function buildHomeMetadataTitle(): string {
  const today = new Date().toLocaleDateString("es-ES", {
    timeZone: MADRID_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return `Qué ver hoy ${today} en TV y streaming`;
}

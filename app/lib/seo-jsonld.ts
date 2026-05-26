import type { EventRow } from "../components/types";
import { displayTime } from "./madrid-time";
import {
  filterEventsInWeek,
  mapEventsToTimezone,
  MADRID_TZ,
} from "./timezone";
import { FEED_DAY_COUNT } from "./events-feed";
import type { SeoHubConfig } from "./seo-hubs";
import {
  eventLabel,
  eventStartIso,
  schemaEventType,
} from "./seo-events";
import {
  defaultDescription,
  homeTitle,
  siteBrand,
  siteName,
  siteUrl,
} from "./seo";

function buildSchemaEvent(event: EventRow, index: number) {
  const name = eventLabel(event);
  const startDate = eventStartIso(event.date, event.time);
  const type = schemaEventType(event.sport);
  const channel = event.platform?.split(",")[0]?.trim();

  return {
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": type,
      name,
      description: [event.competition, event.platform].filter(Boolean).join(" · "),
      ...(startDate
        ? {
            startDate,
            eventStatus: "https://schema.org/EventScheduled",
          }
        : {}),
      ...(channel
        ? {
            broadcastOfEvent: {
              "@type": "BroadcastEvent",
              videoFormat: channel,
            },
          }
        : {}),
      organizer: {
        "@type": "Organization",
        name: event.platform || event.competition || siteBrand,
      },
      ...(event.home_team && event.away_team
        ? {
            competitor: [
              { "@type": "SportsTeam", name: event.home_team },
              { "@type": "SportsTeam", name: event.away_team },
            ],
          }
        : {}),
    },
  };
}

function buildItemList(events: EventRow[], listId: string, listName: string) {
  if (events.length === 0) return null;

  return {
    "@type": "ItemList",
    "@id": listId,
    name: listName,
    numberOfItems: events.length,
    itemListElement: events.map(buildSchemaEvent),
  };
}

function buildFaqPage() {
  return {
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
      {
        "@type": "Question",
        name: "¿Dónde ver la Champions League hoy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Consulta la página de Champions League en queveohoy.es/champions para ver horarios y canales de cada partido en España.",
        },
      },
    ],
  };
}

export function buildHomeJsonLd(events: EventRow[]) {
  const madridEvents = filterEventsInWeek(
    mapEventsToTimezone(events, MADRID_TZ),
    MADRID_TZ,
    FEED_DAY_COUNT
  ).slice(0, 12);

  const itemList = buildItemList(
    madridEvents,
    `${siteUrl}/#events`,
    "Qué ver hoy en la tele"
  );

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
        alternateName: [
          "que veo hoy",
          "qué ver hoy",
          "queveohoy",
          "qué ver hoy en la tele",
        ],
        url: siteUrl,
        description: defaultDescription,
        inLanguage: "es-ES",
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/partidos-hoy`,
          },
          "query-input": "required name=search_term_string",
        },
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
      buildFaqPage(),
      ...(itemList ? [itemList] : []),
    ],
  };
}

export function buildHubJsonLd(hub: SeoHubConfig, events: EventRow[]) {
  const pageUrl = `${siteUrl}/${hub.slug}`;
  const itemList = buildItemList(
    events.slice(0, 24),
    `${pageUrl}/#events`,
    hub.h1
  );

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
        url: siteUrl,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: hub.title,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: hub.h1,
        description: hub.description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        inLanguage: "es-ES",
      },
      ...(itemList ? [itemList] : []),
    ],
  };
}

export function buildHomeMetadataDescription(events: EventRow[]): string {
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

export function buildHomePageLead(events: EventRow[]): string {
  const todayEvents = filterEventsInWeek(
    mapEventsToTimezone(events, MADRID_TZ),
    MADRID_TZ,
    1
  );

  const count = todayEvents.length;
  if (count === 0) {
    return "Partidos, Champions, LaLiga, F1, UFC, baloncesto, series y más con horario y canal en España.";
  }

  return `${count} eventos hoy en TV y streaming: fútbol, Champions, deportes, series y estrenos con horario y canal en España.`;
}

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
  buildDateMetadataDescription,
  filterEventsForDate,
  formatDateForMetadata,
  partidosHoyDatePath,
} from "./seo-date";
import {
  eventLabel,
  eventStartIso,
  schemaEventType,
} from "./seo-events";
import { eventSlug } from "./event-slug";
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

export const HOME_FAQ_ITEMS = [
  {
    question: "¿Qué ver hoy en la tele?",
    answer:
      "En queveohoy.es puedes consultar partidos de fútbol, Champions, LaLiga, F1, MotoGP, UFC, baloncesto, tenis, series y estrenos con horario y canal en España.",
  },
  {
    question: "¿Dónde ver el fútbol hoy?",
    answer:
      "La agenda indica el canal o plataforma de cada partido: DAZN, Movistar, La 1, LaLiga TV, Gol Play, Teledeporte y más.",
  },
  {
    question: "¿A qué hora son los partidos de hoy?",
    answer:
      "Los horarios están en península y Baleares (Europe/Madrid).",
  },
  {
    question: "¿Dónde ver la Champions League hoy?",
      answer:
        "Consulta queveohoy.es/champions y la guía queveohoy.es/guia/champions-espana para horarios y canales de cada partido.",
  },
] as const;

function buildFaqSchema(
  id: string,
  items: readonly { question: string; answer: string }[]
) {
  return {
    "@type": "FAQPage",
    "@id": id,
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

function buildHomeFaqPage() {
  return buildFaqSchema(`${siteUrl}/#faq`, HOME_FAQ_ITEMS);
}

export const HUB_FAQ_BY_SLUG: Record<
  string,
  readonly { question: string; answer: string }[]
> = {
  champions: [
    {
      question: "¿Dónde ver la Champions League en España?",
      answer:
        "La Champions se emite en La 1, Movistar Liga de Campeones, DAZN y a veces en abierto según el partido. En queveohoy.es/champions ves el canal de cada encuentro.",
    },
    {
      question: "¿A qué hora son los partidos de Champions hoy?",
      answer:
        "Los horarios de la Champions están en península y Baleares (Europe/Madrid). Consulta la agenda de hoy en queveohoy.es/champions.",
    },
    {
      question: "¿La Champions es gratis en TV?",
      answer:
        "Algunos partidos se emiten en La 1 u otros canales en abierto; el resto suele estar en Movistar o DAZN. La agenda indica el canal de cada partido.",
    },
  ],
  laliga: [
    {
      question: "¿Dónde ver LaLiga en TV?",
      answer:
        "LaLiga se ve en Movistar LaLiga, DAZN LaLiga y Gol Play. Guía: queveohoy.es/guia/laliga-espana · agenda: queveohoy.es/laliga.",
    },
    {
      question: "¿Qué partidos de LaLiga hay hoy?",
      answer:
        "La agenda de LaLiga en queveohoy.es/laliga lista los partidos de Primera con horario y plataforma para hoy y la semana.",
    },
    {
      question: "¿DAZN o Movistar para ver LaLiga?",
      answer:
        "Depende del partido y los derechos de la jornada. En la agenda verás si toca DAZN LaLiga, Movistar u otro emisor.",
    },
  ],
};

export function getHubFaqItems(
  slug: string
): readonly { question: string; answer: string }[] {
  return HUB_FAQ_BY_SLUG[slug] ?? [];
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
      buildHomeFaqPage(),
      ...(itemList ? [itemList] : []),
    ],
  };
}

export function buildDateJsonLd(dateKey: string, events: EventRow[]) {
  const pageUrl = `${siteUrl}${partidosHoyDatePath(dateKey)}`;
  const dayEvents = filterEventsForDate(events, dateKey);
  const pageName = `Partidos ${formatDateForMetadata(dateKey)} en TV`;
  const itemList = buildItemList(
    dayEvents.slice(0, 24),
    `${pageUrl}/#events`,
    pageName
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
            name: "Partidos hoy en TV",
            item: `${siteUrl}/partidos-hoy`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: formatDateForMetadata(dateKey),
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: pageName,
        description: buildDateMetadataDescription(dateKey, events),
        isPartOf: { "@id": `${siteUrl}/#website` },
        inLanguage: "es-ES",
      },
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
  const hubFaq = getHubFaqItems(hub.slug);

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
      ...(hubFaq.length
        ? [buildFaqSchema(`${pageUrl}/#faq`, hubFaq)]
        : []),
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

export function buildPartidoJsonLd(event: EventRow) {
  const slug = eventSlug(event);
  const pageUrl = `${siteUrl}/partido/${slug}`;
  const name = eventLabel(event);
  const startDate = eventStartIso(event.date, event.time);
  const channel = event.platform?.split(",")[0]?.trim();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          { "@type": "ListItem", position: 2, name, item: pageUrl },
        ],
      },
      {
        "@type": schemaEventType(event.sport),
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
      },
    ],
  };
}

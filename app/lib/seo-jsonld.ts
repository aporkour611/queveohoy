import type { EventRow } from "../components/types";
import { eventDisplayTime } from "./madrid-time";
import {
  filterEventsInWeek,
  mapEventsToTimezone,
  MADRID_TZ,
} from "./timezone";
import { HOME_SSR_DAY_COUNT } from "./home-feed-config";
import { isUfcWeekEditorialWindow } from "./ufc-week";
import { getMadridTodayKey } from "./seo-date";
import type { SeoHubConfig } from "./seo-hubs";
import {
  buildDateMetadataDescription,
  filterEventsForDate,
  formatDateForMetadata,
  partidosHoyDatePath,
} from "./seo-date";
import {
  eventLabel,
  eventStartIsoForEvent,
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
  const startDate = eventStartIsoForEvent(event);
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
  "partidos-hoy": [
    {
      question: "¿Qué partidos hay hoy en la tele?",
      answer:
        "En queveohoy.es/partidos-hoy encuentras todos los eventos deportivos de hoy con horario y canal en España.",
    },
    {
      question: "¿A qué hora son los partidos hoy?",
      answer:
        "Los horarios están en península y Baleares (Europe/Madrid). Consulta la agenda actualizada en queveohoy.es.",
    },
    {
      question: "¿Dónde ver el fútbol hoy en TV?",
      answer:
        "La agenda indica el canal o plataforma de cada partido: DAZN, Movistar, La 1, LaLiga TV, Gol Play y más.",
    },
  ],
  futbol: [
    {
      question: "¿Qué partidos de fútbol hay hoy?",
      answer:
        "La agenda de fútbol en queveohoy.es/futbol incluye LaLiga, Champions, copas y ligas internacionales con horario y canal.",
    },
    {
      question: "¿Dónde ver el fútbol en streaming?",
      answer:
        "Cada partido indica si está en DAZN, Movistar, Gol Play u otro emisor. Filtra por competición en la agenda.",
    },
    {
      question: "¿Horarios de partidos en España?",
      answer:
        "Todos los horarios están en península y Baleares (Europe/Madrid).",
    },
  ],
  "formula-1": [
    {
      question: "¿Dónde ver la Fórmula 1 en España?",
      answer:
        "La F1 se emite en DAZN F1 y a veces en Movistar. En queveohoy.es/formula-1 ves horarios de cada sesión.",
    },
    {
      question: "¿A qué hora es la F1 hoy?",
      answer:
        "Consulta la agenda de F1 en queveohoy.es con horarios en península y Baleares.",
    },
    {
      question: "¿Qué sesiones de F1 hay hoy?",
      answer:
        "Entrenamientos, clasificación y carrera aparecen en la agenda con hora y emisora.",
    },
  ],
  "premier-league": [
    {
      question: "¿Dónde ver la Premier League en España?",
      answer:
        "La Premier se ve en DAZN. En queveohoy.es/premier-league tienes horarios y partidos de la jornada.",
    },
    {
      question: "¿Qué partidos de Premier hay hoy?",
      answer:
        "La agenda lista los encuentros de Premier League con horario en Europe/Madrid.",
    },
  ],
  ufc: [
    {
      question: "¿Dónde ver UFC en España?",
      answer:
        "UFC se emite en DAZN. Consulta queveohoy.es/ufc para horarios de eventos y prelims.",
    },
    {
      question: "¿A qué hora es UFC hoy?",
      answer:
        "Prelims y main card con horario en península (Europe/Madrid) en queveohoy.es/ufc.",
    },
  ],
  nba: [
    {
      question: "¿Dónde ver la NBA en TV?",
      answer:
        "La NBA se ve en Movistar Deportes, NBA League Pass y a veces en La 1. Horarios en queveohoy.es/nba.",
    },
    {
      question: "¿Qué partidos de NBA hay hoy?",
      answer:
        "La agenda en queveohoy.es/nba lista los partidos con horario y canal en España.",
    },
  ],
  motogp: [
    {
      question: "¿Dónde ver MotoGP en España?",
      answer:
        "MotoGP se emite en DAZN. Consulta queveohoy.es/motogp para horarios de carreras y clasificación.",
    },
    {
      question: "¿A qué hora es MotoGP hoy?",
      answer:
        "Los horarios están en península y Baleares (Europe/Madrid) en la agenda de queveohoy.es/motogp.",
    },
  ],
  baloncesto: [
    {
      question: "¿Dónde ver baloncesto hoy en TV?",
      answer:
        "ACB, Euroliga y otras competiciones en Movistar, DAZN y Gol Play. Agenda: queveohoy.es/baloncesto.",
    },
    {
      question: "¿Qué partidos de baloncesto hay hoy?",
      answer:
        "La agenda lista partidos de ACB, Euroliga y más con horario y canal en España.",
    },
  ],
  tenis: [
    {
      question: "¿Dónde ver tenis hoy en TV?",
      answer:
        "Tenis ATP y WTA en Movistar, DAZN y Eurosport. Horarios en queveohoy.es/tenis.",
    },
    {
      question: "¿A qué hora son los partidos de tenis hoy?",
      answer:
        "Consulta la agenda actualizada con horarios en península y Baleares (Europe/Madrid).",
    },
  ],
  ciclismo: [
    {
      question: "¿Dónde ver ciclismo hoy en TV?",
      answer:
        "Etapas de Vuelta, Tour y Giro en Eurosport, La 1 y DAZN. Agenda: queveohoy.es/ciclismo.",
    },
    {
      question: "¿Qué carreras de ciclismo hay hoy?",
      answer:
        "La agenda de ciclismo en queveohoy.es indica horarios y emisoras para hoy y la semana.",
    },
  ],
  esports: [
    {
      question: "¿Dónde ver e-sports hoy?",
      answer:
        "CS2, Valorant, LoL y más en Twitch, YouTube y a veces en Movistar. Horarios en queveohoy.es/esports.",
    },
    {
      question: "¿Qué partidos de e-sports hay hoy?",
      answer:
        "La agenda lista torneos y partidos con hora de inicio en península (Europe/Madrid).",
    },
  ],
  "copa-del-rey": [
    {
      question: "¿Dónde ver la Copa del Rey en TV?",
      answer:
        "La Copa del Rey se emite en La 1, DAZN y Movistar según la ronda. Consulta queveohoy.es/copa-del-rey.",
    },
    {
      question: "¿Qué partidos de Copa del Rey hay hoy?",
      answer:
        "La agenda muestra los encuentros de copa con horario y canal en España.",
    },
  ],
  bundesliga: [
    {
      question: "¿Dónde ver la Bundesliga en España?",
      answer:
        "La Bundesliga se emite en DAZN y Movistar+. Horarios en queveohoy.es/bundesliga.",
    },
    {
      question: "¿Qué partidos de Bundesliga hay hoy?",
      answer:
        "La agenda lista los partidos de la liga alemana con hora en península (Europe/Madrid).",
    },
  ],
  "serie-a": [
    {
      question: "¿Dónde ver la Serie A en TV?",
      answer:
        "La Serie A se ve en DAZN y Movistar+. Consulta queveohoy.es/serie-a.",
    },
    {
      question: "¿Qué partidos de calcio hay hoy?",
      answer:
        "Encuentros de la Serie A con horario y canal en la agenda de queveohoy.es/serie-a.",
    },
  ],
  "ligue-1": [
    {
      question: "¿Dónde ver la Ligue 1 en España?",
      answer:
        "La Ligue 1 se emite en DAZN y Movistar+. Guía en queveohoy.es/ligue-1.",
    },
    {
      question: "¿Qué partidos de Ligue 1 hay hoy?",
      answer:
        "La agenda muestra la jornada francesa con horarios en Europe/Madrid.",
    },
  ],
  "segunda-division": [
    {
      question: "¿Dónde ver Segunda División / Hypermotion?",
      answer:
        "LaLiga Hypermotion se emite en DAZN LaLiga TV Hypermotion y Movistar+. Agenda: queveohoy.es/segunda-division.",
    },
    {
      question: "¿Qué partidos de Segunda hay hoy?",
      answer:
        "Partidos de Segunda con horario y plataforma en la agenda actualizada.",
    },
  ],
  series: [
    {
      question: "¿Qué series y estrenos hay hoy?",
      answer:
        "Estrenos y capítulos nuevos en Netflix, HBO, Movistar+ y más. Agenda: queveohoy.es/series.",
    },
    {
      question: "¿Dónde ver estrenos de series hoy?",
      answer:
        "Cada título indica plataforma y horario en península y Baleares (Europe/Madrid).",
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
    HOME_SSR_DAY_COUNT
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
        logo: `${siteUrl}/logo-queveohoy.svg`,
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
        mainEntity: itemList
          ? { "@id": itemList["@id"] as string }
          : { "@id": `${siteUrl}/#faq` },
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
        logo: `${siteUrl}/logo-queveohoy.svg`,
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
        logo: `${siteUrl}/logo-queveohoy.svg`,
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
  if (isUfcWeekEditorialWindow(getMadridTodayKey())) {
    return "Topuria vs Gaethje en UFC Casablanca (Freedom 250): horario en España, Paramount+ y toda la agenda TV de la semana.";
  }

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
      const time = eventDisplayTime(event);
      const channel = event.platform?.split(",")[0]?.trim();
      return [label, time, channel].filter(Boolean).join(" ");
    })
    .join(" · ");

  return `Qué ver hoy en TV: ${samples}. Fútbol, Champions, deportes y series con horarios y canales en España.`;
}

export function buildHomeMetadataTitle(): string {
  if (isUfcWeekEditorialWindow(getMadridTodayKey())) {
    return "Topuria vs Gaethje — UFC Casablanca | Qué veo hoy";
  }

  const today = new Date().toLocaleDateString("es-ES", {
    timeZone: MADRID_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return `Qué ver hoy ${today} en TV y streaming`;
}

export function buildHomePageLead(events: EventRow[]): string {
  if (isUfcWeekEditorialWindow(getMadridTodayKey())) {
    return "Semana de UFC Casablanca: Topuria vs Gaethje en Freedom 250, horario en península y resto de la agenda TV.";
  }

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
  const startDate = eventStartIsoForEvent(event);
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

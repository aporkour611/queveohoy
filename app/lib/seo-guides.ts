import type { Metadata } from "next";
import { pageMetadata } from "./seo";

export type SeoGuideChannel = {
  name: string;
  detail: string;
};

export type SeoGuideConfig = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  priority: number;
  hubSlug: string;
  hubLabel: string;
  channels: SeoGuideChannel[];
  tip: string;
};

export const SEO_GUIDES: SeoGuideConfig[] = [
  {
    slug: "champions-espana",
    title: "Dónde ver la Champions League en España",
    h1: "Dónde ver la Champions League en TV y streaming",
    description:
      "Guía actualizada: canales y plataformas para ver la Champions League en España (La 1, Movistar, DAZN) y agenda de partidos.",
    keywords: [
      "donde ver champions",
      "champions movistar",
      "champions dazn",
      "champions la 1",
      "champions league españa tv",
    ],
    priority: 0.85,
    hubSlug: "champions",
    hubLabel: "Champions",
    channels: [
      {
        name: "La 1 / RTVE",
        detail: "partidos seleccionados en abierto.",
      },
      {
        name: "Movistar Liga de Campeones",
        detail: "la mayor parte de la fase de liga y muchos playoffs.",
      },
      {
        name: "DAZN",
        detail: "partidos según derechos de la temporada.",
      },
      {
        name: "Otros",
        detail:
          "consulta la fila de cada partido en la agenda — el canal exacto cambia por jornada.",
      },
    ],
    tip: "Los derechos cambian por temporada. La forma más fiable de saber dónde ver un partido concreto es mirar la fila del evento en queveohoy.es: ahí aparece canal y hora.",
  },
  {
    slug: "laliga-espana",
    title: "Dónde ver LaLiga en España",
    h1: "Dónde ver LaLiga en TV y streaming",
    description:
      "Guía para ver LaLiga en España: Movistar LaLiga, DAZN LaLiga, partidos en abierto y agenda diaria con horarios.",
    keywords: [
      "donde ver laliga",
      "laliga movistar",
      "dazn laliga",
      "laliga tv españa",
      "primera division canal",
    ],
    priority: 0.85,
    hubSlug: "laliga",
    hubLabel: "LaLiga",
    channels: [
      {
        name: "Movistar LaLiga",
        detail: "partidos del paquete tradicional de Movistar.",
      },
      {
        name: "DAZN LaLiga",
        detail: "gran parte de la jornada en suscripción.",
      },
      {
        name: "Gol Play / abierto",
        detail: "algunos encuentros en televisión abierta.",
      },
    ],
    tip: "En jornadas con partidos simultáneos, conviene filtrar por LaLiga en la agenda y comparar horarios antes de elegir plataforma.",
  },
  {
    slug: "premier-league-espana",
    title: "Dónde ver la Premier League en España",
    h1: "Dónde ver la Premier League en TV y streaming",
    description:
      "Canales y plataformas para ver la Premier League en España: DAZN, partidos en abierto puntuales y agenda diaria con horarios.",
    keywords: [
      "donde ver premier league",
      "premier dazn españa",
      "premier league tv españa",
      "premier canal",
    ],
    priority: 0.82,
    hubSlug: "premier-league",
    hubLabel: "Premier League",
    channels: [
      {
        name: "DAZN",
        detail: "principal emisor de la Premier League en España.",
      },
      {
        name: "Televisión abierta",
        detail: "algunos partidos destacados en abierto según jornada.",
      },
    ],
    tip: "Los horarios de la Premier suelen caer en franja de tarde-noche peninsular; la agenda los muestra ya convertidos a hora de España.",
  },
  {
    slug: "formula-1-espana",
    title: "Dónde ver la Fórmula 1 en España",
    h1: "Dónde ver la Fórmula 1 en TV y streaming",
    description:
      "Guía para ver F1 en España: DAZN F1, carreras en abierto en La 1 y horarios de clasificación y carrera en la agenda.",
    keywords: [
      "donde ver formula 1",
      "f1 dazn",
      "f1 la 1",
      "formula 1 tv españa",
      "grandes premios canal",
    ],
    priority: 0.82,
    hubSlug: "formula-1",
    hubLabel: "Fórmula 1",
    channels: [
      {
        name: "DAZN F1",
        detail: "todas las sesiones en directo con suscripción.",
      },
      {
        name: "La 1 / RTVE",
        detail: "algunos grandes premios en abierto.",
      },
      {
        name: "Movistar",
        detail: "resúmenes y contenido complementario según temporada.",
      },
    ],
    tip: "Las sesiones de clasificación y carrera tienen horarios distintos; filtra por F1 en la agenda para ver la parrilla completa del fin de semana.",
  },
  {
    slug: "motogp-espana",
    title: "Dónde ver MotoGP en España",
    h1: "Dónde ver MotoGP en TV y streaming",
    description:
      "Canales para ver MotoGP en España: DAZN, carreras en abierto y horarios de entrenamientos, clasificación y carrera.",
    keywords: [
      "donde ver motogp",
      "motogp dazn",
      "motogp tv españa",
      "motogp canal",
    ],
    priority: 0.8,
    hubSlug: "motogp",
    hubLabel: "MotoGP",
    channels: [
      {
        name: "DAZN",
        detail: "emisión principal de MotoGP en España.",
      },
      {
        name: "Televisión abierta",
        detail: "algunas carreras en abierto según acuerdos de la temporada.",
      },
    ],
    tip: "Los horarios de carrera varían según el circuito; la agenda agrupa todas las sesiones del Gran Premio.",
  },
  {
    slug: "ufc-espana",
    title: "Dónde ver la UFC en España",
    h1: "Dónde ver la UFC en TV y streaming",
    description:
      "Guía para ver UFC en España: DAZN, eventos en abierto puntuales y horarios de preliminares y main card.",
    keywords: [
      "donde ver ufc",
      "ufc dazn españa",
      "ufc tv españa",
      "ufc canal",
      "ufc hoy",
    ],
    priority: 0.82,
    hubSlug: "ufc",
    hubLabel: "UFC",
    channels: [
      {
        name: "DAZN",
        detail: "PPV y Fight Nights incluidos en la suscripción.",
      },
      {
        name: "Televisión abierta",
        detail: "algunos eventos destacados en abierto.",
      },
    ],
    tip: "Los main cards suelen empezar de madrugada en horario peninsular; la agenda muestra la hora local de España.",
  },
  {
    slug: "nba-espana",
    title: "Dónde ver la NBA en España",
    h1: "Dónde ver la NBA en TV y streaming",
    description:
      "Plataformas para ver la NBA en España: NBA League Pass, Movistar, partidos en abierto y agenda con horarios convertidos.",
    keywords: [
      "donde ver nba",
      "nba league pass españa",
      "nba movistar",
      "nba tv españa",
      "partidos nba hoy",
    ],
    priority: 0.8,
    hubSlug: "nba",
    hubLabel: "NBA",
    channels: [
      {
        name: "NBA League Pass",
        detail: "partidos en directo y bajo demanda con suscripción.",
      },
      {
        name: "Movistar",
        detail: "partidos seleccionados en canales deportivos.",
      },
      {
        name: "Televisión abierta",
        detail: "algunos playoffs y finales en abierto.",
      },
    ],
    tip: "La NBA tiene muchos partidos simultáneos; usa el hub NBA de la agenda para ver solo los que caen en horario español.",
  },
  {
    slug: "deportes-streaming-espana",
    title: "DAZN, Movistar y plataformas deportivas en España",
    h1: "Guía de plataformas deportivas en España",
    description:
      "Resumen de DAZN, Movistar+, LaLiga TV, NBA League Pass y otras plataformas para saber qué deporte ver en cada servicio.",
    keywords: [
      "dazn deportes españa",
      "movistar deportes",
      "donde ver deportes streaming",
      "plataformas deportivas españa",
    ],
    priority: 0.78,
    hubSlug: "partidos-hoy",
    hubLabel: "todos los deportes",
    channels: [
      {
        name: "DAZN",
        detail: "LaLiga parcial, Premier, F1, MotoGP, UFC y más según temporada.",
      },
      {
        name: "Movistar+",
        detail: "LaLiga, Champions, Liga ACB, tenis y contenido premium.",
      },
      {
        name: "NBA League Pass",
        detail: "temporada regular y playoffs de la NBA.",
      },
      {
        name: "RTVE / La 1",
        detail: "eventos seleccionados en abierto (Champions, F1, Eurocopa…).",
      },
    ],
    tip: "Ninguna plataforma cubre todo. La agenda de queveohoy.es indica el canal concreto de cada evento, no solo la plataforma genérica.",
  },
  {
    slug: "eurocopa-espana",
    title: "Dónde ver la Eurocopa en España",
    h1: "Dónde ver la Eurocopa en TV y streaming",
    description:
      "Guía para ver la Eurocopa en España: partidos de la selección en La 1, RTVE Play, Movistar y agenda con horarios en península.",
    keywords: [
      "donde ver eurocopa",
      "eurocopa tv españa",
      "eurocopa la 1",
      "eurocopa rtve",
      "partidos españa eurocopa",
    ],
    priority: 0.86,
    hubSlug: "futbol",
    hubLabel: "fútbol",
    channels: [
      {
        name: "La 1 / RTVE Play",
        detail: "partidos de la selección española y algunos encuentros clave en abierto.",
      },
      {
        name: "Movistar+",
        detail: "cobertura ampliada de fase de grupos, octavos y finales según derechos.",
      },
      {
        name: "Cuatro / Telecinco",
        detail: "algunos partidos en abierto en fases concretas de la competición.",
      },
      {
        name: "Otros",
        detail:
          "consulta la fila del partido en la agenda — el canal exacto cambia por fase y rival.",
      },
    ],
    tip: "Los partidos de España suelen ir en prime time peninsular. Filtra por fútbol en la agenda para ver solo los encuentros de selecciones y comparar horarios.",
  },
  {
    slug: "roland-garros-espana",
    title: "Dónde ver Roland Garros en España",
    h1: "Dónde ver Roland Garros en TV y streaming",
    description:
      "Canales para ver Roland Garros (French Open) en España: Movistar+, Eurosport, partidos en abierto y horarios de cuadros ATP y WTA.",
    keywords: [
      "donde ver roland garros",
      "roland garros tv españa",
      "french open canal",
      "roland garros movistar",
      "tenis roland garros horario",
    ],
    priority: 0.84,
    hubSlug: "tenis",
    hubLabel: "tenis",
    channels: [
      {
        name: "Movistar+",
        detail: "emisión principal de Roland Garros con sesiones en directo.",
      },
      {
        name: "Eurosport / discovery+",
        detail: "partidos y repeticiones según paquete de la temporada.",
      },
      {
        name: "Televisión abierta",
        detail: "algunas semifinales y finales en abierto en La 1 o Telecinco.",
      },
    ],
    tip: "Los partidos se reparten en varias pistas a la vez; la agenda agrupa los encuentros del día con hora peninsular y canal concreto.",
  },
  {
    slug: "eurovision-espana",
    title: "Dónde ver Eurovisión en España",
    h1: "Dónde ver Eurovisión en TV y streaming",
    description:
      "Guía para ver el Festival de Eurovisión en España: semifinales y final en La 1, RTVE Play y horarios de la gala en directo.",
    keywords: [
      "donde ver eurovision",
      "eurovision tv españa",
      "eurovision la 1",
      "eurovision rtve play",
      "eurovision horario",
    ],
    priority: 0.8,
    hubSlug: "series",
    hubLabel: "series y TV",
    channels: [
      {
        name: "La 1 / RTVE Play",
        detail: "semifinales, final y actuación de España en directo y bajo demanda.",
      },
      {
        name: "RTVE.es",
        detail: "comentarios, ensayos y contenido complementario de la delegación.",
      },
      {
        name: "Otros",
        detail: "retransmisiones internacionales solo con VPN; en España manda RTVE.",
      },
    ],
    tip: "La final cae en sábado noche peninsular. Busca «Eurovisión» en la agenda de series para ver la franja exacta de semifinales y gala.",
  },
  {
    slug: "operacion-triunfo-espana",
    title: "Dónde ver Operación Triunfo en España",
    h1: "Dónde ver Operación Triunfo en TV y streaming",
    description:
      "Canales y plataformas para ver Operación Triunfo (OT) en España: galas en La 1, RTVE Play y horarios de directos semanales.",
    keywords: [
      "donde ver operacion triunfo",
      "ot tv españa",
      "operacion triunfo la 1",
      "ot rtve play",
      "galas ot horario",
    ],
    priority: 0.78,
    hubSlug: "series",
    hubLabel: "series y TV",
    channels: [
      {
        name: "La 1 / RTVE Play",
        detail: "galas en prime time y contenido extra en streaming.",
      },
      {
        name: "RTVE Play",
        detail: "resúmenes, nominaciones y directos complementarios.",
      },
      {
        name: "Redes RTVE",
        detail: "fragmentos y entrevistas; la gala completa está en La 1.",
      },
    ],
    tip: "Las galas suelen ser los domingos por la noche. Filtra por series en la agenda para no perder el directo de nominados y expulsión.",
  },
  {
    slug: "movistar-dazn-deportes",
    title: "Movistar+ vs DAZN: qué deportes ver en cada plataforma",
    h1: "Movistar+ vs DAZN en España",
    description:
      "Comparativa Movistar+ y DAZN: qué competiciones cubre cada plataforma (LaLiga, Champions, Premier, F1, UFC) y cuándo conviene cada una.",
    keywords: [
      "movistar vs dazn",
      "movistar dazn deportes",
      "dazn o movistar futbol",
      "comparativa plataformas deportivas",
      "donde ver deportes movistar dazn",
    ],
    priority: 0.79,
    hubSlug: "partidos-hoy",
    hubLabel: "todos los deportes",
    channels: [
      {
        name: "Movistar+",
        detail: "LaLiga parcial, Champions, Liga ACB, tenis premium y F1 según paquete.",
      },
      {
        name: "DAZN",
        detail: "DAZN LaLiga, Premier League, F1, MotoGP, UFC y eventos bajo demanda.",
      },
      {
        name: "Suscripción combinada",
        detail: "muchos hogares necesitan ambas para cubrir fútbol europeo y ligas domésticas.",
      },
      {
        name: "RTVE / La 1",
        detail: "alternativa en abierto para partidos seleccionados y grandes eventos.",
      },
    ],
    tip: "No compres por el nombre del deporte: mira el canal de cada fila en la agenda. Un mismo fin de semana puede repartir LaLiga entre Movistar y DAZN.",
  },
  {
    slug: "copa-rey-espana",
    title: "Dónde ver la Copa del Rey en España",
    h1: "Dónde ver la Copa del Rey en TV y streaming",
    description:
      "Guía para ver la Copa del Rey en España: partidos en Movistar+, DAZN, RTVE en abierto y agenda con horarios de cada eliminatoria.",
    keywords: [
      "donde ver copa del rey",
      "copa del rey tv españa",
      "copa del rey movistar",
      "copa del rey dazn",
      "copa del rey horario",
    ],
    priority: 0.83,
    hubSlug: "copa-del-rey",
    hubLabel: "Copa del Rey",
    channels: [
      {
        name: "Movistar+",
        detail: "partidos de la competición en sus canales deportivos.",
      },
      {
        name: "DAZN",
        detail: "algunos encuentros según acuerdos de la temporada.",
      },
      {
        name: "La 1 / RTVE",
        detail: "semifinales y final en abierto en años con acuerdo RTVE.",
      },
      {
        name: "Otros",
        detail: "rondas tempranas pueden ir en canales regionales o plataformas del club.",
      },
    ],
    tip: "La final suele ser en La Cartuja con horario nocturno. Usa el hub Copa del Rey para ver solo eliminatorias a partir de octavos o finales.",
  },
];

/** Guías destacadas en el bloque promocional «Dónde ver». */
export const FEATURED_SEO_GUIDE_SLUGS = [
  "eurocopa-espana",
  "roland-garros-espana",
  "eurovision-espana",
  "operacion-triunfo-espana",
  "movistar-dazn-deportes",
  "copa-rey-espana",
] as const;

export const SEO_GUIDE_SLUGS = SEO_GUIDES.map((g) => g.slug);

export function getSeoGuide(slug: string): SeoGuideConfig | undefined {
  return SEO_GUIDES.find((g) => g.slug === slug);
}

export function guideMetadata(guide: SeoGuideConfig): Metadata {
  return pageMetadata(
    `/guia/${guide.slug}`,
    guide.title,
    guide.description,
    guide.keywords
  );
}

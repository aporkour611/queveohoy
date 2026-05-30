import type { EventDayGroups } from "./event-day-group";
import type { EventRow } from "../components/types";

export type FeedPanelVariant = "sports" | "esports" | "motor" | "tv" | "catalog";

export type FeedSectionHeroVariant = "tv" | "sports" | "esports" | "motor" | "catalog";

export type FeedPanelCardLayout =
  | "match"
  | "tv"
  | "poster"
  | "poster-cine"
  | "poster-anime";

export type FeedPanelSubgroup = {
  key: string;
  label: string;
  iconId: string;
  events: EventRow[];
  accentClass?: string;
  shellClassName?: string;
  cardLayout?: FeedPanelCardLayout;
};

export type FeedPanelConfig = {
  variant: FeedPanelVariant;
  heroVariant: FeedSectionHeroVariant;
  ariaLabel: string;
  eyebrow: string;
  title: string;
  lead: string;
  sectionClass: string;
};

export const FEED_PANEL_CONFIG: Record<FeedPanelVariant, FeedPanelConfig> = {
  sports: {
    variant: "sports",
    heroVariant: "sports",
    ariaLabel: "Deportes",
    eyebrow: "Agenda",
    title: "Deportes",
    lead: "Fútbol, tenis, baloncesto, UFC y más con horario y canal en España",
    sectionClass: "qvh-feed-panel qvh-feed-panel-sports",
  },
  esports: {
    variant: "esports",
    heroVariant: "esports",
    ariaLabel: "E-Sports",
    eyebrow: "Competición",
    title: "E-Sports",
    lead: "CS2, Valorant y LoL con horario y dónde verlo en España",
    sectionClass: "qvh-feed-panel qvh-feed-panel-esports",
  },
  motor: {
    variant: "motor",
    heroVariant: "motor",
    ariaLabel: "Motor",
    eyebrow: "Velocidad",
    title: "Motor",
    lead: "Fórmula 1, MotoGP y rally en directo con horario en España",
    sectionClass: "qvh-feed-panel qvh-feed-panel-motor",
  },
  tv: {
    variant: "tv",
    heroVariant: "tv",
    ariaLabel: "TV y Twitch",
    eyebrow: "Televisión",
    title: "TV y Twitch",
    lead: "Reality, concursos y programas en directo con horario en España",
    sectionClass: "qvh-feed-panel qvh-feed-panel-tv",
  },
  catalog: {
    variant: "catalog",
    heroVariant: "catalog",
    ariaLabel: "Cine, series y anime",
    eyebrow: "Streaming",
    title: "Cine, series y anime",
    lead: "Estrenos, capítulos y anime con horario en plataformas en España",
    sectionClass: "qvh-feed-panel qvh-feed-panel-catalog",
  },
};

export type FeedPanelSectionProps = {
  panel: FeedPanelVariant;
  football?: EventDayGroups["football"];
  bySport?: EventDayGroups["bySport"];
  subgroups?: FeedPanelSubgroup[];
  titleOverride?: string;
  leadOverride?: string;
  ariaLabelOverride?: string;
};

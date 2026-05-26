export type ChannelStyle = { label: string; bg: string; color: string; border: string };

const CHANNEL_STYLES: { match: RegExp; style: ChannelStyle }[] = [
  { match: /movistar|m\+/i, style: { label: "", bg: "#00a0e3", color: "#fff", border: "#0090cc" } },
  { match: /dazn/i, style: { label: "", bg: "#f8f8f8", color: "#111", border: "#e5e5e5" } },
  { match: /la\s*1|rtve|teledeporte/i, style: { label: "", bg: "#e30613", color: "#fff", border: "#c90511" } },
  { match: /gol|vamos|orange/i, style: { label: "", bg: "#ff6b00", color: "#fff", border: "#e55f00" } },
  { match: /sky/i, style: { label: "", bg: "#0072c6", color: "#fff", border: "#0060a8" } },
  { match: /twitch/i, style: { label: "", bg: "#9146ff", color: "#fff", border: "#7c3aed" } },
  { match: /youtube/i, style: { label: "", bg: "#ff0000", color: "#fff", border: "#cc0000" } },
  { match: /espn/i, style: { label: "", bg: "#d00", color: "#fff", border: "#b00" } },
];

const DEFAULT_STYLE: ChannelStyle = {
  label: "",
  bg: "#f4f4f5",
  color: "#3f3f46",
  border: "#e4e4e7",
};

export function parseChannels(platform?: string | null): string[] {
  if (!platform?.trim()) return [];
  return platform
    .split(/[,;|/]+/)
    .map((c) => c.trim())
    .filter(Boolean);
}

export function isFreeTvChannel(name: string): boolean {
  return /rtve|teledeporte|la\s*1|gol play|tv3|esport\s*3|etb|ten tv/i.test(name);
}

export function channelStyle(name: string): ChannelStyle {
  const base = CHANNEL_STYLES.find(({ match }) => match.test(name))?.style ?? DEFAULT_STYLE;
  return { ...base, label: name };
}

/** Canales típicos por competición (referencia tipo futbolhoy.es) */
export function defaultChannelsForCompetition(competition?: string | null): string {
  const c = competition?.toLowerCase() ?? "";
  if (c.includes("champions"))
    return "La 1, RTVE Play, M+ Liga de Campeones, Movistar+, Orange Fútbol 1";
  if (c.includes("europa")) return "Movistar+, DAZN";
  if (c.includes("conference")) return "Movistar+, DAZN";
  if (c.includes("primera") || c.includes("laliga") || c.includes("division"))
    return "Movistar+, DAZN LaLiga";
  if (c.includes("premier")) return "Sky Sports, Vamos";
  if (c.includes("bundesliga")) return "DAZN, Movistar+";
  if (c.includes("serie")) return "Movistar+, DAZN";
  if (c.includes("ligue")) return "Movistar+, DAZN";
  if (c.includes("world cup") || c.includes("mundial")) return "Movistar+, RTVE, DAZN";
  return "DAZN, Movistar+";
}

const SPORT_CHANNEL_DEFAULTS: Record<string, string> = {
  formula1: "DAZN F1, Movistar+",
  motos: "DAZN, Movistar+",
  ufc: "DAZN, Movistar+",
  basket: "Movistar+, DAZN",
  tenis: "Movistar+, Eurosport",
  ciclismo: "Eurosport, Teledeporte",
  csgo: "Twitch, YouTube",
  valorant: "Twitch, YouTube",
  lol: "Twitch, YouTube",
  dota2: "Twitch, YouTube",
  tv: "RTVE, Telecinco, Antena 3",
  series: "Movistar+, HBO Max, Netflix",
  cine: "Movistar+, Filmin",
};

/** Canales para mostrar: plataforma real o fallback heurístico. */
export function resolveChannelsForEvent(event: {
  sport?: string | null;
  competition?: string | null;
  platform?: string | null;
}): string[] {
  const fromPlatform = parseChannels(event.platform);
  if (fromPlatform.length) return fromPlatform;

  const sport = event.sport ?? "";
  if (sport === "futbol") {
    return parseChannels(defaultChannelsForCompetition(event.competition));
  }

  const sportDefault = SPORT_CHANNEL_DEFAULTS[sport];
  if (sportDefault) return parseChannels(sportDefault);

  return [];
}

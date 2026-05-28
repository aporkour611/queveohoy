export type ChannelStyle = {
  label: string;
  bg: string;
  color: string;
  border: string;
  tier: "free" | "paid";
};

const CHANNEL_STYLES: { match: RegExp; style: Omit<ChannelStyle, "label" | "tier"> }[] = [
  { match: /movistar|m\+/i, style: { bg: "#00a0e3", color: "#fff", border: "#0090cc" } },
  { match: /dazn/i, style: { bg: "#111", color: "#f5d020", border: "#333" } },
  { match: /la\s*1|rtve|teledeporte/i, style: { bg: "#e30613", color: "#fff", border: "#c90511" } },
  { match: /antena|atresplayer/i, style: { bg: "#ff7328", color: "#fff", border: "#e56520" } },
  { match: /telecinco|mitele|mediaset|cuatro/i, style: { bg: "#00a0e3", color: "#fff", border: "#0088c2" } },
  { match: /gol|vamos|orange/i, style: { bg: "#ff6b00", color: "#fff", border: "#e55f00" } },
  { match: /sky/i, style: { bg: "#0072c6", color: "#fff", border: "#0060a8" } },
  { match: /eurosport/i, style: { bg: "#003087", color: "#fff", border: "#00256a" } },
  { match: /twitch/i, style: { bg: "#9146ff", color: "#fff", border: "#7c3aed" } },
  { match: /youtube/i, style: { bg: "#ff0000", color: "#fff", border: "#cc0000" } },
  { match: /espn/i, style: { bg: "#d00", color: "#fff", border: "#b00" } },
];

const FREE_DEFAULT: Omit<ChannelStyle, "label"> = {
  bg: "#73ae2f",
  color: "#fff",
  border: "#5a9e28",
  tier: "free",
};

const PAID_DEFAULT: Omit<ChannelStyle, "label"> = {
  bg: "#4267b2",
  color: "#fff",
  border: "#3558a0",
  tier: "paid",
};
export function parseChannels(platform?: string | null): string[] {
  if (!platform?.trim()) return [];
  return platform
    .split(/[,;|/·]+/)
    .map((c) => c.trim())
    .filter(Boolean);
}

export function isFreeTvChannel(name: string): boolean {
  return /rtve\s*play|teledeporte|la\s*1\b|gol\s*play|tv3|esport\s*3|etb|ten\s*tv|^rtve$|antena\s*3|atresplayer|atresmedia|la\s*sexta|lasexta|neox|nova|mega|atreseries|telecinco|mitele|mediaset|cuatro/i.test(
    name.trim()
  );
}

function isChampionsFootball(event: {
  sport?: string | null;
  competition?: string | null;
}): boolean {
  return event.sport === "futbol" && /champions/i.test(event.competition ?? "");
}

/** Gratuitos primero; máx. `limit` canales (Champions en UI). */
export function prioritizeChannels(channels: string[], limit = 3): string[] {
  if (channels.length <= limit) return channels;

  const free: string[] = [];
  const paid: string[] = [];

  for (const channel of channels) {
    if (isFreeTvChannel(channel)) free.push(channel);
    else paid.push(channel);
  }

  return [...free, ...paid].slice(0, limit);
}

export function channelStyle(name: string): ChannelStyle {
  const label = name.trim();
  const tier = isFreeTvChannel(label) ? "free" : "paid";
  const brand = CHANNEL_STYLES.find(({ match }) => match.test(label))?.style;

  if (tier === "free") {
    return { ...FREE_DEFAULT, label };
  }

  if (brand) {
    return { ...brand, label, tier };
  }

  return { ...PAID_DEFAULT, label };
}
/** Canales típicos por competición (referencia tipo futbolhoy.es) */
export function defaultChannelsForCompetition(competition?: string | null): string {
  const c = competition?.toLowerCase() ?? "";
  if (c.includes("champions"))
    return "La 1, RTVE Play, M+ Liga de Campeones";
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
  let channels: string[];

  if (fromPlatform.length) {
    channels = fromPlatform;
  } else {
    const sport = event.sport ?? "";
    if (sport === "futbol") {
      channels = parseChannels(defaultChannelsForCompetition(event.competition));
    } else {
      const sportDefault = SPORT_CHANNEL_DEFAULTS[sport];
      channels = sportDefault ? parseChannels(sportDefault) : [];
    }
  }

  if (isChampionsFootball(event)) {
    channels = prioritizeChannels(channels, 3);
  }

  return channels;
}

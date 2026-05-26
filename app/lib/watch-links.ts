import type { EventRow } from "../components/types";
import { parseChannels } from "./channels";

export type WatchLink = {
  url: string;
  label: string;
};

const PLATFORM_RULES: { match: RegExp; url: string; label: string }[] = [
  {
    match: /rtve\s*play|la\s*1|teledeporte|rtve/i,
    url: "https://www.rtve.es/play/",
    label: "RTVE Play",
  },
  {
    match: /gol\s*play|^gol$/i,
    url: "https://www.golplay.es/",
    label: "Gol Play",
  },
  {
    match: /dazn/i,
    url: "https://www.dazn.com/es-ES/home",
    label: "DAZN",
  },
  {
    match: /movistar|m\+|vamos/i,
    url: "https://www.movistarplus.es/",
    label: "Movistar+",
  },
  {
    match: /orange/i,
    url: "https://www.orange.es/",
    label: "Orange TV",
  },
  {
    match: /sky\s*sports/i,
    url: "https://www.skysports.com/",
    label: "Sky Sports",
  },
  {
    match: /twitch/i,
    url: "https://www.twitch.tv/directory",
    label: "Twitch",
  },
  {
    match: /youtube/i,
    url: "https://www.youtube.com/",
    label: "YouTube",
  },
  {
    match: /hbo|max\b/i,
    url: "https://www.max.com/es/es",
    label: "Max",
  },
  {
    match: /netflix/i,
    url: "https://www.netflix.com/es/",
    label: "Netflix",
  },
  {
    match: /disney\+?/i,
    url: "https://www.disneyplus.com/es-es",
    label: "Disney+",
  },
  {
    match: /prime\s*video|amazon/i,
    url: "https://www.primevideo.com/",
    label: "Prime Video",
  },
  {
    match: /apple\s*tv/i,
    url: "https://tv.apple.com/es",
    label: "Apple TV+",
  },
  {
    match: /ufc\s*fight\s*pass/i,
    url: "https://ufcfightpass.com/",
    label: "UFC Fight Pass",
  },
  {
    match: /espn/i,
    url: "https://www.espn.es/",
    label: "ESPN",
  },
  {
    match: /filmin/i,
    url: "https://www.filmin.es/",
    label: "Filmin",
  },
  {
    match: /atresplayer|atresmedia|antena\s*3|lasexta|neox|mega|energy/i,
    url: "https://www.atresplayer.com/",
    label: "Atresplayer",
  },
  {
    match: /telecinco|cuatro|mediaset|mitele/i,
    url: "https://www.mitele.es/",
    label: "Mitele",
  },
  {
    match: /tv3|3cat|ccma/i,
    url: "https://www.3cat.cat/3cat/",
    label: "3Cat",
  },
];

const CHANNEL_PRIORITY = [
  /rtve\s*play/i,
  /la\s*1/i,
  /teledeporte/i,
  /gol\s*play/i,
  /max\b|hbo/i,
  /netflix/i,
  /disney/i,
  /prime\s*video/i,
  /dazn/i,
  /movistar|m\+/i,
  /orange/i,
  /twitch/i,
];

function channelPriority(channel: string): number {
  const index = CHANNEL_PRIORITY.findIndex((pattern) => pattern.test(channel));
  return index === -1 ? 999 : index;
}

function matchChannel(channel: string): WatchLink | null {
  const normalized = channel.trim();
  if (!normalized) return null;

  for (const rule of PLATFORM_RULES) {
    if (rule.match.test(normalized)) {
      return { url: rule.url, label: rule.label };
    }
  }

  return null;
}

function justWatchSearchUrl(title: string): WatchLink {
  const query = encodeURIComponent(title.split(" — ")[0]?.trim() || title.trim());
  return {
    url: `https://www.justwatch.com/es/buscar?q=${query}`,
    label: "JustWatch",
  };
}

export function resolveWatchUrl(event: EventRow): WatchLink | null {
  const channels = parseChannels(event.platform);
  const sortedChannels = [...channels].sort(
    (a, b) => channelPriority(a) - channelPriority(b)
  );

  for (const channel of sortedChannels) {
    const link = matchChannel(channel);
    if (link) return link;
  }

  const platformLink = event.platform ? matchChannel(event.platform) : null;
  if (platformLink) return platformLink;

  if (event.sport === "ufc") {
    return { url: "https://ufcfightpass.com/", label: "UFC Fight Pass" };
  }

  if (
    event.sport === "formula1" ||
    event.competition?.toLowerCase().includes("f1") ||
    event.platform?.toLowerCase().includes("f1")
  ) {
    return { url: "https://www.dazn.com/es-ES/home", label: "DAZN F1" };
  }

  if (event.sport === "motogp") {
    return { url: "https://www.dazn.com/es-ES/home", label: "DAZN" };
  }

  if (event.sport === "cine" || event.sport === "series") {
    return justWatchSearchUrl(event.title ?? "");
  }

  return null;
}

export function openWatchUrl(link: WatchLink) {
  window.open(link.url, "_blank", "noopener,noreferrer");
}

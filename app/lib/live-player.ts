export type LivePlayerKind =
  | "twitch"
  | "rtve"
  | "atresplayer"
  | "mitele"
  | "gol"
  | "tv3"
  | "youtube"
  | "external";

export type LivePlayerEmbed = {
  kind: LivePlayerKind;
  channel: string;
  /** URL del iframe cuando el emisor permite incrustar el reproductor. */
  embedSrc: string | null;
  /** El emisor prohíbe iframe en sitios de terceros (p. ej. Mediaset). */
  embedBlocked?: boolean;
  embedBlockedReason?: string;
  externalUrl: string;
  playerTitle: string;
};

const ATRESPLAYER_LIVE_SLUGS: { match: RegExp; slug: string; title: string }[] = [
  { match: /antena\s*3|a3\b/i, slug: "antena3", title: "Antena 3" },
  { match: /la\s*sexta|lasexta/i, slug: "lasexta", title: "laSexta" },
  { match: /neox/i, slug: "neox", title: "Neox" },
  { match: /nova/i, slug: "nova", title: "Nova" },
  { match: /mega/i, slug: "mega", title: "Mega" },
  { match: /atreseries/i, slug: "atreseries", title: "Atreseries" },
];

const MITELE_LIVE_SLUGS: { match: RegExp; slug: string; title: string }[] = [
  { match: /telecinco|t5\b/i, slug: "telecinco", title: "Telecinco" },
  { match: /cuatro/i, slug: "cuatro", title: "Cuatro" },
  { match: /\bfdf\b/i, slug: "fdf", title: "Factoría de Ficción" },
  { match: /boing/i, slug: "boing", title: "Boing" },
  { match: /energy/i, slug: "energy", title: "Energy" },
  { match: /divinity/i, slug: "divinity", title: "Divinity" },
  { match: /be\s*mad/i, slug: "bemad", title: "Be Mad" },
];

/** Canales con página /directo (reproductor embebido o enlace oficial). */
export function hasLiveWatchPage(channel: string): boolean {
  const lower = channel.toLowerCase();
  return /rtve|la\s*1|la\s*2|teledeporte|twitch|gol\s*play|^gol\b|tv3|ccma|3cat|youtube|antena|atresplayer|atresmedia|la\s*sexta|lasexta|neox|nova|mega|atreseries|telecinco|mitele|mediaset|cuatro|infinity/i.test(
    lower
  );
}

/** Canales gratuitos con página de directo en la app. */
export const FREE_LIVE_CHANNEL_NAMES = [
  "La 1",
  "RTVE",
  "Teledeporte",
  "Antena 3",
  "laSexta",
  "Telecinco",
  "Cuatro",
  "Twitch",
  "Gol Play",
  "3Cat",
] as const;

function twitchChannelSlug(channel: string): string | null {
  const parts = channel.split(/[·,|/]+/).map((part) => part.trim());
  const twitchIndex = parts.findIndex((part) => /twitch/i.test(part));
  const next = parts[twitchIndex + 1];
  if (!next || /youtube/i.test(next)) return null;

  const slug = next
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "");

  return slug || null;
}

function youtubeEmbedFromChannel(channel: string): string | null {
  const parts = channel.split(/[·,|/]+/).map((part) => part.trim());
  for (const part of parts) {
    const watchMatch = part.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
    );
    if (watchMatch?.[1]) {
      return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?autoplay=1`;
    }
    const channelMatch = part.match(
      /youtube\.com\/(?:channel\/|@)([a-zA-Z0-9_-]+)/
    );
    if (channelMatch?.[1]) {
      const id = channelMatch[1];
      if (id.startsWith("UC")) {
        return `https://www.youtube-nocookie.com/embed/live_stream?channel=${encodeURIComponent(id)}&autoplay=1`;
      }
    }
  }
  return null;
}

function embedParents(siteOrigin: string): string {
  const hosts = new Set<string>(["localhost", "127.0.0.1"]);

  try {
    hosts.add(new URL(siteOrigin).hostname);
  } catch {
    hosts.add("queveohoy.es");
  }

  return [...hosts].map((host) => `parent=${encodeURIComponent(host)}`).join("&");
}

function resolveAtresplayerLive(channel: string): LivePlayerEmbed | null {
  const match = ATRESPLAYER_LIVE_SLUGS.find(({ match: pattern }) =>
    pattern.test(channel)
  );
  if (!match && !/atresplayer|atresmedia/i.test(channel)) return null;

  const slug = match?.slug ?? "antena3";
  const title = match?.title ?? "Antena 3";
  const externalUrl = `https://www.atresplayer.com/directos/${slug}/`;

  return {
    kind: "atresplayer",
    channel,
    embedSrc: externalUrl,
    externalUrl,
    playerTitle: `${title} en directo · ATRESPLAYER TV`,
  };
}

function resolveMiteleLive(channel: string): LivePlayerEmbed | null {
  const match = MITELE_LIVE_SLUGS.find(({ match: pattern }) =>
    pattern.test(channel)
  );
  if (!match && !/mitele|mediaset|infinity/i.test(channel)) return null;

  const slug = match?.slug ?? "telecinco";
  const title = match?.title ?? "Telecinco";
  const externalUrl = `https://www.mediasetinfinity.es/directo/${slug}/`;

  return {
    kind: "mitele",
    channel,
    embedSrc: null,
    embedBlocked: true,
    embedBlockedReason:
      "Mediaset Infinity solo permite ver el directo en su web y apps. No ofrece reproductor embebible para otras páginas.",
    externalUrl,
    playerTitle: `${title} en directo · Mediaset Infinity`,
  };
}

function resolveRtveLive(channel: string): LivePlayerEmbed | null {
  const lower = channel.toLowerCase();
  if (!/rtve|la\s*1|la\s*2|teledeporte|clan|24h/.test(lower)) return null;

  let embedSrc = "https://www.rtve.es/play/embed/directo/";
  let playerTitle = "RTVE en directo";

  if (/la\s*1/.test(lower)) {
    embedSrc = "https://www.rtve.es/play/embed/directo/television/la-1/";
    playerTitle = "La 1 en directo";
  } else if (/teledeporte|tdp/.test(lower)) {
    embedSrc =
      "https://www.rtve.es/play/embed/directo/television/teledeporte/";
    playerTitle = "Teledeporte en directo";
  }

  return {
    kind: "rtve",
    channel,
    embedSrc,
    externalUrl: "https://www.rtve.es/play/en-directo/",
    playerTitle,
  };
}

/** iframe o enlace externo según el canal en abierto gratuito. */
export function resolveLivePlayerEmbed(
  channel: string,
  siteOrigin: string
): LivePlayerEmbed {
  const lower = channel.toLowerCase();

  if (/twitch/.test(lower)) {
    const slug = twitchChannelSlug(channel);
    const externalUrl = slug
      ? `https://www.twitch.tv/${slug}`
      : "https://www.twitch.tv/";
    const parents = embedParents(siteOrigin);
    const embedSrc = slug
      ? `https://player.twitch.tv/?channel=${encodeURIComponent(slug)}&${parents}&autoplay=true`
      : null;

    return {
      kind: "twitch",
      channel,
      embedSrc,
      externalUrl,
      playerTitle: slug ? `Twitch · ${slug}` : "Twitch",
    };
  }

  const rtve = resolveRtveLive(channel);
  if (rtve) return rtve;

  const atres = resolveAtresplayerLive(channel);
  if (atres) return atres;

  const mitele = resolveMiteleLive(channel);
  if (mitele) return mitele;

  if (/gol\s*play|^gol\b/.test(lower)) {
    return {
      kind: "gol",
      channel,
      embedSrc: null,
      externalUrl: "https://www.golplay.es/directos",
      playerTitle: "Gol Play",
    };
  }

  if (/tv3|ccma|3cat/.test(lower)) {
    return {
      kind: "tv3",
      channel,
      embedSrc: "https://www.ccma.cat/embed/live/3cat/",
      externalUrl: "https://www.ccma.cat/3cat/directes/",
      playerTitle: "3Cat en directo",
    };
  }

  if (/youtube/.test(lower)) {
    const embedSrc = youtubeEmbedFromChannel(channel);
    return {
      kind: "youtube",
      channel,
      embedSrc,
      externalUrl: "https://www.youtube.com/",
      playerTitle: "YouTube",
    };
  }

  return {
    kind: "external",
    channel,
    embedSrc: null,
    externalUrl: "https://www.rtve.es/play/en-directo/",
    playerTitle: channel,
  };
}

export type LivePlayerKind =
  | "twitch"
  | "rtve"
  | "atresplayer"
  | "gol"
  | "tv3"
  | "youtube"
  | "external";

/** Canales con página /directo (embed o enlace oficial). */
export function hasLiveWatchPage(channel: string): boolean {
  const lower = channel.toLowerCase();
  return /rtve|la\s*1|teledeporte|twitch|gol\s*play|^gol\b|tv3|ccma|3cat|youtube|antena|atresplayer/i.test(
    lower
  );
}

export type LivePlayerEmbed = {
  kind: LivePlayerKind;
  channel: string;
  embedSrc: string | null;
  externalUrl: string;
  playerTitle: string;
};

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

function embedParents(siteOrigin: string): string {
  const hosts = new Set<string>(["localhost", "127.0.0.1"]);

  try {
    hosts.add(new URL(siteOrigin).hostname);
  } catch {
    hosts.add("queveohoy.es");
  }

  return [...hosts].map((host) => `parent=${encodeURIComponent(host)}`).join("&");
}

/** iframe o enlace externo según el canal en abierto. */
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

  if (/rtve|la\s*1|teledeporte/.test(lower)) {
    let embedSrc = "https://www.rtve.es/play/embed/directo/";
    if (/la\s*1/.test(lower)) {
      embedSrc = "https://www.rtve.es/play/embed/directo/television/la-1/";
    } else if (/teledeporte/.test(lower)) {
      embedSrc =
        "https://www.rtve.es/play/embed/directo/television/teledeporte/";
    }

    return {
      kind: "rtve",
      channel,
      embedSrc,
      externalUrl: "https://www.rtve.es/play/en-directo/",
      playerTitle: /la\s*1/.test(lower) ? "La 1 en directo" : "RTVE en directo",
    };
  }

  if (/antena|atresplayer/.test(lower)) {
    return {
      kind: "atresplayer",
      channel,
      embedSrc: null,
      externalUrl: "https://www.atresplayer.com/directos/antena3/",
      playerTitle: "Antena 3 en directo · ATRESPLAYER TV",
    };
  }

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
    return {
      kind: "youtube",
      channel,
      embedSrc: null,
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

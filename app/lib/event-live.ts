import type { EventRow } from "../components/types";
import {
  isFreeTvChannel,
  parseChannels,
  resolveChannelsForEvent,
} from "./channels";
import { madridDateTimeToUtc, toMadridDateKey } from "./madrid-time";

export type FreeLiveBroadcast = {
  channel: string;
  watchUrl: string | null;
};

/** Emisión en abierto o streaming gratuito (Twitch, YouTube, RTVE…). */
export function isFreeLiveChannel(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (isFreeTvChannel(trimmed)) return true;
  return /twitch|youtube/i.test(trimmed);
}

function estimateDurationMinutes(event: EventRow): number {
  switch (event.sport) {
    case "futbol":
      return 115;
    case "ufc":
      return 240;
    case "cine":
      return 150;
    case "series":
    case "tv":
      return 95;
    case "formula1":
    case "motos":
      return 150;
    case "basket":
      return 150;
    case "tenis":
      return 180;
    default:
      return 120;
  }
}

/** true si el evento está en su franja horaria hoy (hora Madrid). */
export function isEventLiveNow(event: EventRow, now = new Date()): boolean {
  if (!event.date?.trim() || !event.time?.trim()) return false;
  if (event.date !== toMadridDateKey(now)) return false;

  const start = madridDateTimeToUtc(event.date, event.time);
  const endMs = start.getTime() + estimateDurationMinutes(event) * 60_000;
  const nowMs = now.getTime();

  return nowMs >= start.getTime() && nowMs < endMs;
}

function liveChannelWatchUrl(channel: string): string | null {
  const lower = channel.toLowerCase();

  if (/rtve|la\s*1|teledeporte/.test(lower)) {
    return "https://www.rtve.es/play/en-directo/";
  }
  if (/gol\s*play|^gol\b/.test(lower)) {
    return "https://www.golplay.es/directos";
  }
  if (/tv3|ccma|3cat/.test(lower)) {
    return "https://www.ccma.cat/3cat/directes/";
  }
  if (/twitch/.test(lower)) {
    const parts = channel.split(/[·,|/]+/).map((part) => part.trim());
    const twitchIndex = parts.findIndex((part) => /twitch/i.test(part));
    const next = parts[twitchIndex + 1];
    if (next && !/youtube/i.test(next)) {
      const slug = next
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "");
      if (slug) return `https://www.twitch.tv/${slug}`;
    }
    return "https://www.twitch.tv/";
  }
  if (/youtube/.test(lower)) {
    return "https://www.youtube.com/";
  }

  return null;
}

function resolveWatchChannels(event: EventRow): string[] {
  const fromResolver = resolveChannelsForEvent(event);
  if (fromResolver.length) return fromResolver;
  return parseChannels(event.platform);
}

/** Primer canal en abierto si el evento está en directo ahora. */
export function getFreeLiveBroadcast(
  event: EventRow,
  now = new Date()
): FreeLiveBroadcast | null {
  if (!isEventLiveNow(event, now)) return null;

  const freeChannel = resolveWatchChannels(event).find(isFreeLiveChannel);
  if (!freeChannel) return null;

  return {
    channel: freeChannel,
    watchUrl: liveChannelWatchUrl(freeChannel),
  };
}

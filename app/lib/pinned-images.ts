import registry from "./pinned-images.json";
import { normalizeRemoteImageUrl, safeRemoteImageUrl } from "./remote-image";
import { preferLocalWebpUrl } from "./prefer-local-webp";

export type PinnedImageEntry = {
  local: string;
  remote: string;
  kind: "esports-team" | "football-team" | "basket-team";
  pinnedAt: string;
};

export type PinnedImageRegistry = {
  version: number;
  byKey: Record<string, PinnedImageEntry>;
  byRemote: Record<string, string>;
};

const REGISTRY = registry as PinnedImageRegistry;

export function pinnedRegistry(): PinnedImageRegistry {
  return REGISTRY;
}

export function esportsTeamRegistryKey(teamId: number | string): string {
  return `esports:team:${teamId}`;
}

export function footballTeamRegistryKey(teamId: number | string): string {
  return `football:team:${teamId}`;
}

export function basketTeamRegistryKey(abbr: string): string {
  return `basket:nba:${abbr.trim().toUpperCase()}`;
}

/** ID numérico PandaScore en URLs de escudo. */
export function extractPandascoreTeamId(url?: string | null): number | null {
  if (!url?.trim()) return null;
  const match = url.match(/\/images\/team\/image\/(\d+)\//i);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) ? id : null;
}

export function lookupPinnedByKey(key?: string | null): string | null {
  if (!key?.trim()) return null;
  const entry = REGISTRY.byKey[key.trim()];
  return entry?.local ?? null;
}

export function lookupPinnedLocalUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;

  if (url.startsWith("/crests/")) {
    return preferLocalWebpUrl(url);
  }

  const normalized = normalizeRemoteImageUrl(url);
  if (!normalized) return null;

  const byRemote = REGISTRY.byRemote[normalized];
  if (byRemote) return preferLocalWebpUrl(byRemote);

  const teamId = extractPandascoreTeamId(normalized);
  if (teamId != null) {
    const byKey = lookupPinnedByKey(esportsTeamRegistryKey(teamId));
    if (byKey) return preferLocalWebpUrl(byKey);
  }

  return null;
}

/** Lista de URLs para TeamCrest: local fijado primero, luego remoto + fallbacks. */
export function resolveCrestUrlList(
  registryKey: string | null,
  primary?: string | null,
  fallbacks: string[] = []
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const add = (candidate?: string | null) => {
    if (!candidate?.trim()) return;
    const pinned = lookupPinnedLocalUrl(candidate);
    if (pinned && !seen.has(pinned)) {
      seen.add(pinned);
      out.push(pinned);
    }
    const safe = safeRemoteImageUrl(candidate);
    const value = safe ?? (candidate.startsWith("/") ? candidate : null);
    if (!value || seen.has(value)) return;
    seen.add(value);
    out.push(value);
  };

  if (registryKey) add(lookupPinnedByKey(registryKey));
  add(primary);
  for (const url of fallbacks) add(url);

  return out;
}

export function resolveEsportsCrestUrls(
  logoUrl?: string | null,
  fallbackUrls: string[] = []
): string[] {
  const teamId = extractPandascoreTeamId(logoUrl);
  const key = teamId != null ? esportsTeamRegistryKey(teamId) : null;
  return resolveCrestUrlList(key, logoUrl, fallbackUrls);
}

export function resolveFootballCrestUrls(teamId: string): string[] {
  const remote = `https://crests.football-data.org/${teamId}.png`;
  return resolveCrestUrlList(footballTeamRegistryKey(teamId), remote, [
    remote.replace(".png", ".svg"),
  ]);
}

export function resolveBasketCrestUrls(abbr: string, fallbackUrls: string[]): string[] {
  return resolveCrestUrlList(basketTeamRegistryKey(abbr), fallbackUrls[0], fallbackUrls);
}

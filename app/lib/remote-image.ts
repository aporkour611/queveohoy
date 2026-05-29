/** Hostnames permitidos en next/image (debe coincidir con next.config.ts). */
export const REMOTE_IMAGE_HOSTS = new Set([
  "crests.football-data.org",
  "cdn.pandascore.co",
  "cdn-api.pandascore.co",
  "image.tmdb.org",
  "cdn.myanimelist.net",
  "r2.thesportsdb.com",
  "www.thesportsdb.com",
  "a.espncdn.com",
]);

/** Normaliza URLs de logos e-sports y evita hosts que rompen next/image. */
export function normalizeRemoteImageUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;

  let normalized = url.trim().replace(/^http:\/\//i, "https://");

  normalized = normalized.replace(
    /^https:\/\/cdn-api\.pandascore\.co\//i,
    "https://cdn.pandascore.co/"
  );

  return normalized;
}

export function isAllowedRemoteImageUrl(url?: string | null): boolean {
  const normalized = normalizeRemoteImageUrl(url);
  if (!normalized) return false;

  try {
    const host = new URL(normalized).hostname.toLowerCase();
    return REMOTE_IMAGE_HOSTS.has(host);
  } catch {
    return false;
  }
}

export function safeRemoteImageUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;

  const trimmed = url.trim();
  if (trimmed.startsWith("/")) return trimmed;

  const normalized = normalizeRemoteImageUrl(trimmed);
  if (!normalized || !isAllowedRemoteImageUrl(normalized)) return null;
  return normalized;
}

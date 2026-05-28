const POSTER_PREFIX = "jikan:poster:";
const BUZZ_SUFFIX = "|buzz:";

export function encodeJikanSource(
  posterUrl?: string | null,
  buzzScore?: number
): string {
  const base = posterUrl?.trim()
    ? `${POSTER_PREFIX}${posterUrl.trim()}`
    : POSTER_PREFIX;
  if (!buzzScore || buzzScore <= 0) return base;
  return `${base}${BUZZ_SUFFIX}${buzzScore}`;
}

export function parseJikanPoster(
  source?: string | null,
  size: "thumb" | "card" | "poster" = "card"
): string | null {
  const raw = source?.split("|")[0];
  if (!raw?.startsWith(POSTER_PREFIX)) return null;
  const url = raw.slice(POSTER_PREFIX.length).trim();
  if (!url.startsWith("http")) return null;

  if (size === "poster") {
    return url.includes("l.jpg") ? url : url.replace(/\.jpg$/, "l.jpg");
  }

  return url.includes("t.jpg") ? url : url.replace(/\.jpg$/, "t.jpg");
}

export function parseJikanBuzzScore(source?: string | null): number {
  const match = source?.match(/\|buzz:(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export { POSTER_PREFIX, BUZZ_SUFFIX };

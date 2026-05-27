/** Slug estable para rutas /directo/[slug]. */
export function channelSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function channelWatchPath(channel: string): string {
  return `/directo/${channelSlug(channel)}`;
}

export function findChannelBySlug(
  slug: string,
  candidates: string[]
): string | undefined {
  const seen = new Set<string>();
  for (const channel of candidates) {
    const trimmed = channel.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    if (channelSlug(trimmed) === slug) return trimmed;
  }
  return undefined;
}

/** Canales únicos del feed (platform + resueltos por deporte). */
export function collectFeedChannelNames(
  events: { platform?: string | null; sport?: string | null; competition?: string | null; home_team?: string | null; away_team?: string | null }[],
  resolve: (event: (typeof events)[number]) => string[]
): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const event of events) {
    const fromPlatform = (event.platform ?? "")
      .split(/[,;|/]+/)
      .map((part) => part.trim())
      .filter(Boolean);

    for (const ch of [...fromPlatform, ...resolve(event)]) {
      if (!ch || seen.has(ch)) continue;
      seen.add(ch);
      names.push(ch);
    }
  }

  return names;
}

import type { SpanishTvShow } from "./spanish-tv-curated";
import { fetchJsonWithTimeout } from "./fetch-json";

const RTVE_API = "https://api.rtve.es/api";

type RtveProgramItem = {
  id?: number | string;
  name?: string;
};

type RtveProgramPage = {
  page?: {
    items?: RtveProgramItem[];
    numElements?: number;
  };
};

const programIdCache = new Map<string, number>();

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function scoreProgramMatch(name: string, show: SpanishTvShow): number {
  const normalized = normalizeName(name);
  const search = normalizeName(show.search);
  if (normalized === search) return 100;
  if (show.patterns.some((pattern) => pattern.test(name))) return 80;
  if (normalized.includes(search) || search.includes(normalized)) return 40;
  return 0;
}

function parseProgramId(raw?: number | string): number | null {
  if (typeof raw === "number" && raw > 0) return raw;
  if (typeof raw === "string" && /^\d+$/.test(raw)) return Number(raw);
  return null;
}

/** Busca el ID de programa RTVE por nombre (cache en memoria por proceso). */
export async function resolveRtveProgramId(
  show: SpanishTvShow
): Promise<number | null> {
  if (show.rtveProgramId) return show.rtveProgramId;

  const cacheKey = show.id;
  const cached = programIdCache.get(cacheKey);
  if (cached) return cached;

  let bestId: number | null = null;
  let bestScore = 0;

  for (let page = 1; page <= 12; page += 1) {
    const result = await fetchJsonWithTimeout<RtveProgramPage>(
      `${RTVE_API}/programas.json?size=200&page=${page}`,
      { next: { revalidate: 0 } },
      12_000
    );

    if (!result.ok || !result.data?.page?.items?.length) break;

    for (const item of result.data.page.items) {
      const name = item.name?.trim();
      if (!name) continue;

      const score = scoreProgramMatch(name, show);
      if (score <= bestScore) continue;

      const id = parseProgramId(item.id);
      if (!id) continue;

      bestScore = score;
      bestId = id;
      if (score >= 100) break;
    }

    if (bestScore >= 100) break;
    if ((result.data.page.numElements ?? 0) === 0) break;
  }

  if (bestId && bestScore >= 40) {
    programIdCache.set(cacheKey, bestId);
    return bestId;
  }

  return null;
}

export function isRtveLinearShow(show: SpanishTvShow): boolean {
  return /rtve|la\s*1|la\s*2/i.test(show.platform);
}

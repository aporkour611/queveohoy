import type { EventRow } from "../components/types";
import { fetchFeedEvents } from "./events-feed-server";
import { partidoSlugsForSitemap } from "./event-slug";
import {
  getRollingSeoDateKeys,
  isPastSeoDate,
  partidosHoyDatePath,
} from "./seo-date";
import { SEO_GUIDE_SLUGS } from "./seo-guides";
import { SEO_HUB_SLUGS } from "./seo-hubs";
import { siteUrl } from "./seo";

export function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (key) return key;

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return "dev-indexnow-key";
}

export function getIndexNowKeyLocation(): string | null {
  const key = getIndexNowKey();
  if (!key) return null;
  return `${siteUrl}/${key}.txt`;
}

export async function collectIndexNowUrls(): Promise<string[]> {
  const urls = new Set<string>([siteUrl]);

  for (const slug of SEO_HUB_SLUGS) {
    urls.add(`${siteUrl}/${slug}`);
  }

  for (const slug of SEO_GUIDE_SLUGS) {
    urls.add(`${siteUrl}/guia/${slug}`);
  }

  for (const dateKey of getRollingSeoDateKeys()) {
    urls.add(`${siteUrl}${partidosHoyDatePath(dateKey)}`);
  }

  const { events } = await fetchFeedEvents();
  const futureEvents = events.filter(
    (event): event is EventRow & { date: string } =>
      Boolean(event.date && !isPastSeoDate(event.date))
  );

  for (const slug of partidoSlugsForSitemap(futureEvents)) {
    urls.add(`${siteUrl}/partido/${slug}`);
  }

  urls.add(`${siteUrl}/privacidad`);
  urls.add(`${siteUrl}/cookies`);

  return [...urls];
}

export async function pingIndexNow(
  urlList?: string[]
): Promise<{ ok: boolean; status?: number; skipped?: boolean; error?: string }> {
  const list = urlList ?? (await collectIndexNowUrls());
  const key = getIndexNowKey();

  if (!key) {
    return { ok: false, skipped: true, error: "INDEXNOW_KEY missing" };
  }

  if (!list.length) {
    return { ok: false, skipped: true, error: "empty url list" };
  }

  let host: string;
  try {
    host = new URL(siteUrl).hostname;
  } catch {
    return { ok: false, error: "invalid siteUrl" };
  }

  const keyLocation = getIndexNowKeyLocation();
  if (!keyLocation) {
    return { ok: false, skipped: true, error: "INDEXNOW_KEY missing" };
  }

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList: list.slice(0, 10_000),
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        status: res.status,
        error: text.slice(0, 200) || res.statusText,
      };
    }

    return { ok: true, status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

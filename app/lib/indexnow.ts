import { SEO_GUIDE_SLUGS } from "./seo-guides";
import { SEO_HUB_SLUGS } from "./seo-hubs";
import {
  getRollingSeoDateKeys,
  partidosHoyDatePath,
} from "./seo-date";
import { siteUrl } from "./seo";

/** Clave pública IndexNow (también en /public/{key}.txt). */
export const DEFAULT_INDEXNOW_KEY = "8f3c2e1d4b5a6978queveohoy";

export function getIndexNowKey(): string {
  return process.env.INDEXNOW_KEY?.trim() || DEFAULT_INDEXNOW_KEY;
}

export function getIndexNowKeyLocation(): string {
  return `${siteUrl}/${getIndexNowKey()}.txt`;
}

export function collectIndexNowUrls(): string[] {
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

  urls.add(`${siteUrl}/privacidad`);
  urls.add(`${siteUrl}/cookies`);

  return [...urls];
}

export async function pingIndexNow(
  urlList: string[] = collectIndexNowUrls()
): Promise<{ ok: boolean; status?: number; skipped?: boolean; error?: string }> {
  const key = getIndexNowKey();

  if (!urlList.length) {
    return { ok: false, skipped: true, error: "empty url list" };
  }

  let host: string;
  try {
    host = new URL(siteUrl).hostname;
  } catch {
    return { ok: false, error: "invalid siteUrl" };
  }

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: getIndexNowKeyLocation(),
        urlList: urlList.slice(0, 10_000),
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

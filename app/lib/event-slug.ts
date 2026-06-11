import type { EventRow } from "../components/types";
import { eventLabel } from "./seo-events";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function eventSlug(event: EventRow): string {
  const label = slugify(eventLabel(event));
  const date = event.date ?? "sin-fecha";
  return `${date}-${label || "evento"}`;
}

export function partidoPath(event: EventRow): string {
  return `/partido/${eventSlug(event)}`;
}

export function findEventBySlug(
  events: EventRow[],
  slug: string
): EventRow | undefined {
  return events.find((event) => eventSlug(event) === slug);
}

/** Slug `/partido/2026-06-11-real-madrid-barcelona` → fecha + resto. */
export function parsePartidoSlug(
  slug: string
): { date: string; labelSlug: string } | null {
  const match = slug.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  if (!match?.[1] || !match[2]) return null;
  return { date: match[1], labelSlug: match[2] };
}

export const SITEMAP_PARTIDO_LIMIT = 200;

export function partidoSlugsForSitemap(
  events: EventRow[],
  limit = SITEMAP_PARTIDO_LIMIT
): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];

  for (const event of events) {
    const slug = eventSlug(event);
    if (seen.has(slug)) continue;
    seen.add(slug);
    slugs.push(slug);
    if (slugs.length >= limit) break;
  }

  return slugs;
}

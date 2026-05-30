import type { EventRow } from "../components/types"

/** ETag ligero para respuestas JSON del feed (ids + fechas visibles). */
export function buildFeedEtag(events: Pick<EventRow, "id" | "date">[]): string {
  const sample = events
    .slice(0, 48)
    .map((e) => `${e.id}:${e.date ?? ""}`)
    .join("|")
  const payload = `${events.length}:${sample}`
  return `"${Buffer.from(payload).toString("base64url").slice(0, 40)}"`
}

export function feedNotModified(
  request: Request,
  etag: string
): boolean {
  const ifNoneMatch = request.headers.get("if-none-match")
  return Boolean(ifNoneMatch && ifNoneMatch === etag)
}

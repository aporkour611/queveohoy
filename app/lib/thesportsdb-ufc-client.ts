export type UfcKind = "ppv" | "fight-night" | "road" | "other";

export function ufcKindLabel(kind: UfcKind): string {
  if (kind === "ppv") return "PPV";
  if (kind === "fight-night") return "Fight Night";
  if (kind === "road") return "Road to UFC";
  return "UFC";
}

export function parseUfcImage(source?: string | null): string | null {
  if (!source?.startsWith("ufc")) return null;
  const match = source.match(/\|img:([^|]+)/) ?? source.match(/^ufc\|img:([^|]+)/);
  return match?.[1]?.trim() || null;
}

export function parseUfcKindFromSource(source?: string | null): UfcKind {
  const match = source?.match(/\|kind:(ppv|fight-night|road|other)/);
  return (match?.[1] as UfcKind) || "other";
}

export function parseUfcEventNumberFromSource(source?: string | null): number | null {
  const match = source?.match(/\|num:(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

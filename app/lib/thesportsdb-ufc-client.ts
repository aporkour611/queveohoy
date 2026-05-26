export type UfcKind = "ppv" | "fight-night" | "road" | "other";

export type UfcFighterImages = {
  f1?: string;
  f2?: string;
};

export type UfcMainEventFighters = {
  n1: string;
  n2: string;
};

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

export function parseUfcFighterImages(source?: string | null): UfcFighterImages {
  const f1 = source?.match(/\|f1:([^|]+)/)?.[1]?.trim();
  const f2 = source?.match(/\|f2:([^|]+)/)?.[1]?.trim();
  return { f1: f1 || undefined, f2: f2 || undefined };
}

export function parseUfcMainEventFighters(
  competition?: string | null,
  title?: string | null
): UfcMainEventFighters | null {
  for (const raw of [competition, title]) {
    const parsed = parseVsMatchup(raw);
    if (parsed) return parsed;
  }
  return null;
}

function parseVsMatchup(text?: string | null): UfcMainEventFighters | null {
  if (!text?.trim()) return null;

  const cleaned = text
    .replace(/^UFC(?:\s+Fight\s+Night)?(?:\s+\d+)?\s+/i, "")
    .trim();

  if (!/\svs\.?\s/i.test(cleaned)) return null;

  const [n1, n2] = cleaned.split(/\s+vs\.?\s+/i);
  if (!n1?.trim() || !n2?.trim()) return null;

  return {
    n1: cleanFighterName(n1),
    n2: cleanFighterName(n2),
  };
}

function cleanFighterName(name: string): string {
  return name.replace(/\s+\d+$/, "").trim();
}

export function parseUfcKindFromSource(source?: string | null): UfcKind {
  const match = source?.match(/\|kind:(ppv|fight-night|road|other)/);
  return (match?.[1] as UfcKind) || "other";
}

export function parseUfcEventNumberFromSource(source?: string | null): number | null {
  const match = source?.match(/\|num:(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export function encodeUfcSource(meta: {
  img?: string | null;
  f1?: string | null;
  f2?: string | null;
  kind?: UfcKind;
  eventNumber?: number;
}): string {
  const parts = ["ufc"];
  if (meta.f1?.trim()) parts.push(`f1:${meta.f1.trim()}`);
  if (meta.f2?.trim()) parts.push(`f2:${meta.f2.trim()}`);
  if (!meta.f1?.trim()) {
    const image = meta.img?.trim();
    if (image) parts.push(`img:${image}`);
  }
  if (meta.eventNumber) parts.push(`num:${meta.eventNumber}`);
  if (meta.kind) parts.push(`kind:${meta.kind}`);
  return parts.join("|");
}

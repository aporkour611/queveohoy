/** CJK, hangul y kana: scripts que no deben mostrarse sin traducción latina. */
const NON_LATIN_SCRIPT_RE = /[\u3000-\u9fff\uac00-\ud7af\u3040-\u30ff]/;

/** Título apto para UI: solo caracteres latinos (incluye acentos españoles). */
export function hasSpanishDisplayTitle(title: string | null | undefined): boolean {
  const trimmed = title?.trim();
  if (!trimmed) return false;
  return !NON_LATIN_SCRIPT_RE.test(trimmed);
}

/** Devuelve el primer candidato en latín o null si no hay traducción usable. */
export function resolveSpanishDisplayTitle(
  candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed && hasSpanishDisplayTitle(trimmed)) return trimmed;
  }
  return null;
}

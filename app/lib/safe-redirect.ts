const INTERNAL_PATH =
  /^\/(?!\/)(?:[\w\-./]*[\w\-./])?(?:\?[\w\-./=&%+]*)?(?:#[\w\-./]*)?$/

/** Paths internos seguros post-OAuth (rechaza //evil.com, backslashes, etc.). */
export function sanitizeInternalRedirectPath(
  raw: string | null | undefined,
  fallback = "/cuenta"
): string {
  if (!raw || typeof raw !== "string") return fallback

  const trimmed = raw.trim()
  if (!trimmed.startsWith("/")) return fallback
  if (trimmed.startsWith("//")) return fallback
  if (trimmed.includes("\\")) return fallback
  if (trimmed.includes("%5c") || trimmed.includes("%2f%2f")) return fallback

  try {
    const decoded = decodeURIComponent(trimmed)
    if (decoded.startsWith("//") || decoded.includes("\\")) return fallback
  } catch {
    return fallback
  }

  if (!INTERNAL_PATH.test(trimmed)) return fallback

  return trimmed
}

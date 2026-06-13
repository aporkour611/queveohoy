const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "10.0.2.2"])

export function ensureHttpsOrigin(raw: string | undefined, fallback: string): string {
  const value = raw?.trim() || fallback
  try {
    const withScheme = value.includes("://") ? value : `https://${value}`
    const url = new URL(withScheme)

    if (url.protocol === "http:" && !LOCAL_HOSTS.has(url.hostname)) {
      url.protocol = "https:"
    }

    return url.origin
  } catch {
    return fallback
  }
}

export function isLikelyTlsError(message: string): boolean {
  return /ssl|tls|certificate|cert invalid|cleartext|trust anchor|handshake|ATS policy|secure connection to/i.test(
    message
  )
}

export function formatMobileNetworkError(message: string): string {
  if (isLikelyTlsError(message)) {
    return "No se pudo establecer conexión segura con queveohoy.es. Comprueba la fecha del móvil y prueba otra red (Wi‑Fi o datos)."
  }
  if (/timeout|timed out|aborted|network request failed/i.test(message)) {
    return "El servidor tardó en responder. Pulsa Reintentar — suele ser cold start tras inactividad."
  }
  return message
}

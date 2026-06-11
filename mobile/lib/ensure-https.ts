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
  return /ssl|tls|certificate|cert|secure|cleartext|trust/i.test(message)
}

export function formatMobileNetworkError(message: string): string {
  if (isLikelyTlsError(message)) {
    return "Conexión no segura. No abras la app en el navegador del móvil (http). Usa Expo Go o entra en https://queveohoy.es"
  }
  return message
}

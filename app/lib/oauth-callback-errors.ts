import type { OAuthProviderId } from "./oauth-providers"

const PROVIDER_LABELS: Record<OAuthProviderId, string> = {
  google: "Google",
  apple: "Apple",
  azure: "Microsoft",
}

export type OAuthLoginErrorParams = {
  error: string
  provider?: string | null
  detail?: string | null
  next?: string | null
}

export function buildOAuthLoginRedirectPath(
  origin: string,
  params: OAuthLoginErrorParams
): string {
  const url = new URL("/cuenta/login", origin)
  url.searchParams.set("error", params.error)
  if (params.provider?.trim()) {
    url.searchParams.set("provider", params.provider.trim())
  }
  if (params.detail?.trim()) {
    url.searchParams.set("detail", params.detail.trim().slice(0, 180))
  }
  if (params.next?.trim()) {
    url.searchParams.set("next", params.next.trim())
  }
  return `${url.pathname}${url.search}`
}

function providerLabel(provider?: string | null): string | null {
  if (!provider) return null
  const key = provider.trim().toLowerCase() as OAuthProviderId
  return PROVIDER_LABELS[key] ?? provider
}

export function resolveOAuthLoginErrorMessage(
  errorKey?: string | null,
  provider?: string | null,
  detail?: string | null
): string | null {
  if (!errorKey) return null

  const label = providerLabel(provider)
  const prefix = label ? `Con ${label}: ` : ""

  switch (errorKey) {
    case "access_denied":
      return `${prefix}cancelaste el inicio de sesión. Puedes probar otro método.`
    case "exchange_failed":
      return `${prefix}no se pudo completar el inicio de sesión${
        detail ? `: ${detail}` : ". Prueba de nuevo."
      }`
    case "missing_code":
      return "Enlace de inicio de sesión incompleto. Solicita uno nuevo."
    case "auth":
      return `${prefix}no se pudo completar el inicio de sesión. Prueba de nuevo.`
    default:
      if (detail) return `${prefix}${detail}`
      return `${prefix}error de autenticación (${errorKey}). Prueba de nuevo.`
  }
}

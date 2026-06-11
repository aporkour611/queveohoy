/** Proveedores OAuth habilitados en Supabase (cuenta). */
export const OAUTH_PROVIDERS = [
  { id: "google" as const, label: "Google", className: "fh-auth-oauth-google" },
  { id: "apple" as const, label: "Apple", className: "fh-auth-oauth-apple" },
  { id: "azure" as const, label: "Microsoft", className: "fh-auth-oauth-microsoft" },
]

export type OAuthProviderId = (typeof OAUTH_PROVIDERS)[number]["id"]

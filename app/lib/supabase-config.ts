function firstNonEmpty(...values: Array<string | undefined>): string | null {
  for (const raw of values) {
    const value = raw?.trim();
    if (value) return value;
  }
  return null;
}

function requireEnv(name: string, value: string | null): string {
  if (value) return value;
  throw new Error(
    `Falta ${name}. Copia .env.example a .env.local y configura las variables.`
  );
}

/** Inert placeholders so client modules load without .env (dev / optional Supabase). */
export const SUPABASE_PLACEHOLDER_URL = "http://127.0.0.1:54321";
export const SUPABASE_PLACEHOLDER_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

function resolvePublishableKeyFromEnv(): string | null {
  const key = firstNonEmpty(
    process.env.SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  if (key?.startsWith("sb_publishable_") || key?.startsWith("eyJ")) {
    return key;
  }

  return null;
}

/** URL for browser/server clients; never throws (check isSupabaseConfigured before querying). */
export function resolveSupabaseUrl(): string {
  return (
    firstNonEmpty(
      process.env.SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_URL
    ) ?? SUPABASE_PLACEHOLDER_URL
  );
}

/** Clave pública para clientes; never throws (check isSupabaseConfigured before querying). */
export function resolveSupabasePublishableKey(): string {
  return resolvePublishableKeyFromEnv() ?? SUPABASE_PLACEHOLDER_ANON_KEY;
}

export function getSupabaseUrl(): string {
  return requireEnv(
    "SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL",
    firstNonEmpty(
      process.env.SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_URL
    )
  );
}

/** Clave pública (sb_publishable_ / anon JWT): respeta RLS */
export function getSupabasePublishableKey(): string {
  return requireEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    resolvePublishableKeyFromEnv()
  );
}

/** Clave de servidor (sb_secret_ / service_role JWT): omite RLS */
export function getSupabaseSecretKey(): string | null {
  const key = firstNonEmpty(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SECRET_KEY
  );

  if (!key) return null;
  if (key.startsWith("sb_secret_") || key.startsWith("eyJ")) return key;
  return null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    firstNonEmpty(
      process.env.SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_URL
    ) &&
      firstNonEmpty(
        process.env.SUPABASE_ANON_KEY,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      )
  );
}

export type BrowserSupabaseConfig = {
  url: string;
  publishableKey: string;
};

/** Public Supabase client config; safe to pass to the browser (server reads runtime env). */
export function resolveBrowserSupabaseConfig(): BrowserSupabaseConfig | null {
  const url = firstNonEmpty(
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const publishableKey = resolvePublishableKeyFromEnv();
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

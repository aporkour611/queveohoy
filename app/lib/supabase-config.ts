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

export function getSupabaseUrl(): string {
  return requireEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    firstNonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL)
  );
}

/** Clave pública (sb_publishable_ / anon JWT): respeta RLS */
export function getSupabasePublishableKey(): string {
  const key = firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  if (key?.startsWith("sb_publishable_") || key?.startsWith("eyJ")) {
    return key;
  }

  return requireEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    null
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
    firstNonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      firstNonEmpty(
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      )
  );
}

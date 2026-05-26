import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://ctfzprpghyuikucxiogj.supabase.co";

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_URL;
}

function supabaseUrl(): string {
  return getSupabaseUrl();
}

/** Clave de servidor (sb_secret_ / service_role JWT): omite RLS */
export function getSupabaseSecretKey(): string | null {
  const candidates = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SECRET_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ];

  for (const raw of candidates) {
    const key = raw?.trim();
    if (!key) continue;
    if (key.startsWith("sb_secret_")) return key;
    if (key.startsWith("eyJ") && key.length > 80) return key;
  }

  return null;
}

/** Clave pública (sb_publishable_ / anon JWT): respeta RLS */
export function getSupabasePublishableKey(): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ];

  for (const raw of candidates) {
    const key = raw?.trim();
    if (!key) continue;
    if (key.startsWith("sb_publishable_")) return key;
    if (key.startsWith("eyJ") && key.length <= 80) return key;
  }

  return null;
}

export function createSupabaseAdmin(): SupabaseClient {
  const secretKey = getSupabaseSecretKey();
  if (!secretKey) {
    throw new Error(
      "Falta clave secreta de Supabase (sb_secret_). Revisa SUPABASE_SERVICE_ROLE_KEY en Vercel."
    );
  }

  return createClient(supabaseUrl(), secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

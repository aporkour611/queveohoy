import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://ctfzprpghyuikucxiogj.supabase.co";
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_9AQGxxhbul9pmhgGUb6cew_uoXtGsFu";

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_URL;
}

function supabaseUrl(): string {
  return getSupabaseUrl();
}

function firstNonEmpty(...values: Array<string | undefined>) {
  for (const raw of values) {
    const value = raw?.trim();
    if (value) return value;
  }
  return null;
}

/** Clave de servidor (sb_secret_ / service_role JWT): omite RLS */
export function getSupabaseSecretKey(): string | null {
  const key = firstNonEmpty(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SECRET_KEY
  );

  if (!key) return null;
  if (key.startsWith("sb_secret_")) return key;
  if (key.startsWith("eyJ")) return key;
  return null;
}

/** Clave pública (sb_publishable_ / anon JWT): respeta RLS */
export function getSupabasePublishableKey(): string {
  const key = firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  if (key?.startsWith("sb_publishable_")) return key;
  if (key?.startsWith("eyJ")) return key;

  return DEFAULT_PUBLISHABLE_KEY;
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

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseSecretKey,
  getSupabaseUrl,
} from "./supabase-config";
import { createSupabaseFetch } from "./supabase-fetch";

export {
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./supabase-config";

type SupabaseAdminOptions = {
  /** Tope HTTP; cron usa el default alto; health puede pasar uno bajo. */
  fetchTimeoutMs?: number;
};

const SUPABASE_ADMIN_DEFAULT_FETCH_TIMEOUT_MS = 30_000;

export function createSupabaseAdmin(
  options?: SupabaseAdminOptions
): SupabaseClient {
  const secretKey = getSupabaseSecretKey();
  if (!secretKey) {
    throw new Error(
      "Falta clave secreta de Supabase (sb_secret_). Revisa SUPABASE_SERVICE_ROLE_KEY en Vercel."
    );
  }

  const fetchTimeoutMs =
    options?.fetchTimeoutMs ?? SUPABASE_ADMIN_DEFAULT_FETCH_TIMEOUT_MS;

  return createClient(getSupabaseUrl(), secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: createSupabaseFetch(fetchTimeoutMs),
    },
  });
}

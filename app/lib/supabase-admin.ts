import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseSecretKey,
  getSupabaseUrl,
} from "./supabase-config";

export {
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./supabase-config";

export function createSupabaseAdmin(): SupabaseClient {
  const secretKey = getSupabaseSecretKey();
  if (!secretKey) {
    throw new Error(
      "Falta clave secreta de Supabase (sb_secret_). Revisa SUPABASE_SERVICE_ROLE_KEY en Vercel."
    );
  }

  return createClient(getSupabaseUrl(), secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

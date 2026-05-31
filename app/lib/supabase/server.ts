import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "../supabase-config";
import { createSupabaseFetch } from "../supabase-fetch";

/** Tope HTTP al API REST de Supabase (feed SSR / warm). */
export const SUPABASE_SERVER_FETCH_TIMEOUT_MS = 6_000;

export function createClient() {
  return createSupabaseClient(
    resolveSupabaseUrl(),
    resolveSupabasePublishableKey(),
    {
      global: {
        fetch: createSupabaseFetch(SUPABASE_SERVER_FETCH_TIMEOUT_MS),
      },
    }
  );
}

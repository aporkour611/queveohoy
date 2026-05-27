import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "../supabase-config";

export function createClient() {
  return createSupabaseClient(
    resolveSupabaseUrl(),
    resolveSupabasePublishableKey()
  );
}

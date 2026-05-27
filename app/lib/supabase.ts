import { createClient } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "./supabase-config";

export const supabaseConfigured = isSupabaseConfigured();

export const supabase = createClient(
  resolveSupabaseUrl(),
  resolveSupabasePublishableKey()
);

import { createClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./supabase-config";

export const supabaseConfigured = isSupabaseConfigured();

export const supabase = createClient(getSupabaseUrl(), getSupabasePublishableKey());

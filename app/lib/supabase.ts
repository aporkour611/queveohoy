import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey } from "./supabase-admin";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "https://ctfzprpghyuikucxiogj.supabase.co";

const supabaseKey =
  getSupabasePublishableKey() ||
  "sb_publishable_9AQGxxhbul9pmhgGUb6cew_uoXtGsFu";

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    getSupabasePublishableKey()
);

export const supabase = createClient(supabaseUrl, supabaseKey);

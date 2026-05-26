import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "../supabase-admin";

export function createClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabasePublishableKey());
}

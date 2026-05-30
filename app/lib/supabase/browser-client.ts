import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  isSupabaseConfigured,
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "../supabase-config"

let cachedClient: SupabaseClient | null = null

export { isSupabaseConfigured }

export function createBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null

  if (!cachedClient) {
    cachedClient = createSupabaseBrowserClient(
      resolveSupabaseUrl(),
      resolveSupabasePublishableKey()
    )
  }

  return cachedClient
}

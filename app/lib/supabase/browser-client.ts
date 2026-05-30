import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  getActiveBrowserSupabaseConfig,
  isBrowserSupabaseAvailable,
} from "./browser-runtime"

let cachedClient: SupabaseClient | null = null
let cachedConfigKey: string | null = null

export { isBrowserSupabaseAvailable as isSupabaseConfigured }

export function createBrowserClient(): SupabaseClient | null {
  const config = getActiveBrowserSupabaseConfig()
  if (!config) return null

  const configKey = `${config.url}\0${config.publishableKey}`
  if (!cachedClient || cachedConfigKey !== configKey) {
    cachedClient = createSupabaseBrowserClient(
      config.url,
      config.publishableKey
    )
    cachedConfigKey = configKey
  }

  return cachedClient
}

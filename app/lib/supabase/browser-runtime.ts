import type { BrowserSupabaseConfig } from "../supabase-config"
import {
  isSupabaseConfigured,
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "../supabase-config"

let injectedConfig: BrowserSupabaseConfig | null = null

export function setInjectedBrowserSupabaseConfig(
  config: BrowserSupabaseConfig | null
): void {
  injectedConfig = config
}

export function getActiveBrowserSupabaseConfig(): BrowserSupabaseConfig | null {
  if (injectedConfig?.url && injectedConfig.publishableKey) {
    return injectedConfig
  }

  if (!isSupabaseConfigured()) return null

  return {
    url: resolveSupabaseUrl(),
    publishableKey: resolveSupabasePublishableKey(),
  }
}

export function isBrowserSupabaseAvailable(): boolean {
  return getActiveBrowserSupabaseConfig() !== null
}

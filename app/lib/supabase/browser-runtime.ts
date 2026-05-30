import type { BrowserSupabaseConfig } from "../supabase-config"
import {
  isSupabaseConfigured,
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "../supabase-config"

declare global {
  interface Window {
    __QVH_SUPABASE__?: BrowserSupabaseConfig
  }
}

let injectedConfig: BrowserSupabaseConfig | null = null

function readWindowSupabaseConfig(): BrowserSupabaseConfig | null {
  if (typeof window === "undefined") return null

  const config = window.__QVH_SUPABASE__
  if (config?.url && config.publishableKey) return config

  return null
}

/** Inline script for layout `<head>` so every client chunk reads the same runtime config. */
export function buildSupabaseBootstrapScript(
  config: BrowserSupabaseConfig | null
): string | null {
  if (!config?.url || !config.publishableKey) return null

  return `(function(){try{window.__QVH_SUPABASE__=${JSON.stringify(config)}}catch(e){}})();`
}

export function setInjectedBrowserSupabaseConfig(
  config: BrowserSupabaseConfig | null
): void {
  injectedConfig = config

  if (typeof window !== "undefined" && config?.url && config.publishableKey) {
    window.__QVH_SUPABASE__ = config
  }
}

export function getActiveBrowserSupabaseConfig(): BrowserSupabaseConfig | null {
  const fromWindow = readWindowSupabaseConfig()
  if (fromWindow) return fromWindow

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

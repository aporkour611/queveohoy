"use client"

import { useLayoutEffect } from "react"
import type { BrowserSupabaseConfig } from "@/app/lib/supabase-config"
import { setInjectedBrowserSupabaseConfig } from "@/app/lib/supabase/browser-runtime"

type Props = {
  config: BrowserSupabaseConfig | null
}

export const SupabaseBrowserConfig = ({ config }: Props) => {
  setInjectedBrowserSupabaseConfig(config)

  useLayoutEffect(() => {
    setInjectedBrowserSupabaseConfig(config)
  }, [config])

  return null
}

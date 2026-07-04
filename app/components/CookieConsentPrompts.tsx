"use client"

import { useEffect, useState, type ComponentType } from "react"
import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate"

type PromptBundle = {
  CookieConsentBanner: ComponentType
  PushNotificationPrompt: ComponentType
  InstallAppPrompt: ComponentType
}

/** Prompts diferidos — import() en idle, sin preload next/dynamic. */
export function CookieConsentPrompts() {
  const deferHeavy = shouldDeferHeavyClient()
  const [prompts, setPrompts] = useState<PromptBundle | null>(null)

  useEffect(() => {
    if (deferHeavy) return
    const schedule = () => {
      void Promise.all([
        import("./CookieConsentBanner"),
        import("./PushNotifications"),
        import("./InstallAppPrompt"),
      ]).then(([banner, push, install]) => {
        setPrompts({
          CookieConsentBanner: banner.CookieConsentBanner,
          PushNotificationPrompt: push.PushNotificationPrompt,
          InstallAppPrompt: install.InstallAppPrompt,
        })
      })
    }
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(schedule, { timeout: 45_000 })
      return () => window.cancelIdleCallback(idleId)
    }
    const fallback = window.setTimeout(schedule, 45_000)
    return () => window.clearTimeout(fallback)
  }, [deferHeavy])

  if (deferHeavy || !prompts) return null

  const { CookieConsentBanner, PushNotificationPrompt, InstallAppPrompt } = prompts

  return (
    <>
      <CookieConsentBanner />
      <PushNotificationPrompt />
      <InstallAppPrompt />
    </>
  )
}

"use client"

import { useCallback, useState } from "react"
import {
  applyThemeToDocument,
  readStoredThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/app/lib/theme"

const LABELS = {
  system: "Tema del sistema",
  light: "Tema claro",
  dark: "Tema oscuro",
} as const

const CYCLE: ThemePreference[] = ["system", "light", "dark"]

function nextPreference(current: ThemePreference): ThemePreference {
  const index = CYCLE.indexOf(current)
  return CYCLE[(index + 1) % CYCLE.length] ?? "system"
}

/** Toggle de tema sin ThemeProvider en el root (menos hidratación). */
export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    typeof window === "undefined" ? "system" : readStoredThemePreference()
  )

  const handleCycle = useCallback(() => {
    setPreference((current) => {
      const next = nextPreference(current)
      const resolved = resolveTheme(next)
      applyThemeToDocument(resolved)
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const label = LABELS[preference]

  return (
    <button
      type="button"
      className="qvh-theme-toggle fh-nav-action-btn"
      aria-label={`${label}. Pulsa para cambiar.`}
      title={label}
      onClick={handleCycle}
    >
      <span className="qvh-theme-toggle-icon" aria-hidden>
        {preference === "light" ? "☀" : preference === "dark" ? "☾" : "◐"}
      </span>
      <span className="sr-only">{label}</span>
    </button>
  )
}

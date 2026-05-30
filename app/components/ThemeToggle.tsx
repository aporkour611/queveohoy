"use client"

import { useTheme } from "./ThemeProvider"

const LABELS = {
  system: "Tema del sistema",
  light: "Tema claro",
  dark: "Tema oscuro",
} as const

export function ThemeToggle() {
  const { preference, cyclePreference } = useTheme()

  const label = LABELS[preference]

  return (
    <button
      type="button"
      className="qvh-theme-toggle fh-nav-action-btn"
      aria-label={`${label}. Pulsa para cambiar.`}
      title={label}
      onClick={cyclePreference}
    >
      <span className="qvh-theme-toggle-icon" aria-hidden>
        {preference === "light" ? "☀" : preference === "dark" ? "☾" : "◐"}
      </span>
      <span className="sr-only">{label}</span>
    </button>
  )
}

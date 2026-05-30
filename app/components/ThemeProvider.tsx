"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  applyThemeToDocument,
  readStoredThemePreference,
  resolveTheme,
  resolveThemeFromMedia,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from "@/app/lib/theme"

type ThemeContextValue = {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (next: ThemePreference) => void
  cyclePreference: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const CYCLE: ThemePreference[] = ["system", "light", "dark"]

function readInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "system"
  return readStoredThemePreference()
}

function readInitialResolved(): ResolvedTheme {
  if (typeof window === "undefined") return "dark"
  return resolveTheme(readStoredThemePreference())
}

function nextPreference(current: ThemePreference): ThemePreference {
  const index = CYCLE.indexOf(current)
  return CYCLE[(index + 1) % CYCLE.length] ?? "system"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    readInitialPreference
  )
  const [resolved, setResolved] = useState<ResolvedTheme>(readInitialResolved)

  useEffect(() => {
    applyThemeToDocument(resolved)
  }, [resolved])

  useEffect(() => {
    if (preference !== "system") return

    const media = window.matchMedia("(prefers-color-scheme: light)")
    const handleChange = () => {
      const next = resolveThemeFromMedia()
      setResolved(next)
    }

    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [preference])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    const resolvedNext = resolveTheme(next)
    setResolved(resolvedNext)
    applyThemeToDocument(resolvedNext)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const cyclePreference = useCallback(() => {
    setPreference(nextPreference(preference))
  }, [preference, setPreference])

  const value = useMemo(
    () => ({ preference, resolved, setPreference, cyclePreference }),
    [preference, resolved, setPreference, cyclePreference]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return ctx
}

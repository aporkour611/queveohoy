export type ThemePreference = "system" | "light" | "dark"

export type ResolvedTheme = "light" | "dark"

export const THEME_STORAGE_KEY = "qvh-theme-preference"

export const resolveThemeFromMedia = (): ResolvedTheme => {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark"
}

export const resolveTheme = (preference: ThemePreference): ResolvedTheme => {
  if (preference === "system") return resolveThemeFromMedia()
  return preference
}

export const readStoredThemePreference = (): ThemePreference => {
  if (typeof window === "undefined") return "system"
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === "light" || raw === "dark" || raw === "system") return raw
  } catch {
    /* ignore */
  }
  return "system"
}

export const applyThemeToDocument = (resolved: ResolvedTheme): void => {
  if (typeof document === "undefined") return
  document.documentElement.dataset.theme = resolved
  document.documentElement.style.colorScheme = resolved
}

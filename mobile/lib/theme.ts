export type ThemeMode = "system" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"

export type ThemeColors = {
  bg: string
  bgElevated: string
  bgCard: string
  border: string
  text: string
  textMuted: string
  textSubtle: string
  accent: string
  accentBg: string
  error: string
  warning: string
  success: string
  tabBar: string
  tabBorder: string
  inputBg: string
  switchTrackOff: string
  switchTrackOn: string
  switchThumbOff: string
  switchThumbOn: string
}

export const THEME_STORAGE_KEY = "qvh:mobile:theme-mode"

export const darkColors: ThemeColors = {
  bg: "#0a0a0a",
  bgElevated: "#171717",
  bgCard: "#171717",
  border: "#262626",
  text: "#fafafa",
  textMuted: "#a3a3a3",
  textSubtle: "#737373",
  accent: "#a3e635",
  accentBg: "#365314",
  error: "#fca5a5",
  warning: "#fbbf24",
  success: "#86efac",
  tabBar: "#0a0a0a",
  tabBorder: "#262626",
  inputBg: "#171717",
  switchTrackOff: "#404040",
  switchTrackOn: "#365314",
  switchThumbOff: "#737373",
  switchThumbOn: "#a3e635",
}

export const lightColors: ThemeColors = {
  bg: "#fafafa",
  bgElevated: "#ffffff",
  bgCard: "#ffffff",
  border: "#e5e5e5",
  text: "#171717",
  textMuted: "#525252",
  textSubtle: "#737373",
  accent: "#4d7c0f",
  accentBg: "#ecfccb",
  error: "#b91c1c",
  warning: "#b45309",
  success: "#15803d",
  tabBar: "#ffffff",
  tabBorder: "#e5e5e5",
  inputBg: "#ffffff",
  switchTrackOff: "#d4d4d4",
  switchTrackOn: "#84cc16",
  switchThumbOff: "#fafafa",
  switchThumbOn: "#ffffff",
}

export function resolveTheme(
  mode: ThemeMode,
  systemScheme: "light" | "dark" | null | undefined
): ResolvedTheme {
  if (mode === "light") return "light"
  if (mode === "dark") return "dark"
  return systemScheme === "light" ? "light" : "dark"
}

export function colorsForTheme(resolved: ResolvedTheme): ThemeColors {
  return resolved === "light" ? lightColors : darkColors
}

export const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  system: "Sistema",
  light: "Claro",
  dark: "Oscuro",
}

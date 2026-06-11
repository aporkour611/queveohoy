import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useColorScheme } from "react-native"
import {
  colorsForTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemeColors,
  type ThemeMode,
} from "./theme"

type ThemeContextValue = {
  mode: ThemeMode
  resolved: "light" | "dark"
  colors: ThemeColors
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>("system")

  useEffect(() => {
    void AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setModeState(stored)
      }
    })
  }, [])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    void AsyncStorage.setItem(THEME_STORAGE_KEY, next)
  }, [])

  const resolved = resolveTheme(mode, systemScheme)
  const colors = useMemo(() => colorsForTheme(resolved), [resolved])

  const value = useMemo(
    () => ({ mode, resolved, colors, setMode }),
    [mode, resolved, colors, setMode]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return ctx
}

import { Pressable, StyleSheet, Text, View } from "react-native"
import { THEME_MODE_LABELS, type ThemeMode } from "@/lib/theme"
import { useTheme } from "@/lib/theme-context"

const MODES: ThemeMode[] = ["system", "light", "dark"]

export function ThemeSettings() {
  const { mode, colors, setMode } = useTheme()

  return (
    <View
      style={[
        styles.box,
        { backgroundColor: colors.bgElevated, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Apariencia</Text>
      <Text style={[styles.lead, { color: colors.textMuted }]}>
        Elige tema claro, oscuro o seguir el del sistema.
      </Text>
      <View style={styles.row}>
        {MODES.map((item) => {
          const active = mode === item
          return (
            <Pressable
              key={item}
              style={[
                styles.chip,
                {
                  borderColor: active ? colors.accent : colors.border,
                  backgroundColor: active ? colors.accentBg : colors.bgCard,
                },
              ]}
              onPress={() => setMode(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Tema ${THEME_MODE_LABELS[item]}`}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? colors.accent : colors.text },
                ]}
              >
                {THEME_MODE_LABELS[item]}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  lead: {
    fontSize: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontWeight: "600",
    fontSize: 14,
  },
})

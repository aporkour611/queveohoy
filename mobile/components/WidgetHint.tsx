"use client"

import { Platform, StyleSheet, Text, View } from "react-native"
import { useTheme } from "@/lib/theme-context"

export function WidgetHint() {
  const { colors } = useTheme()

  if (Platform.OS !== "android") return null

  return (
    <View
      style={[
        styles.box,
        { backgroundColor: colors.bgElevated, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Widget de escritorio</Text>
      <Text style={[styles.lead, { color: colors.textMuted }]}>
        Tras instalar el APK (EAS), mantén pulsado el escritorio → Widgets →{" "}
        <Text style={{ fontWeight: "700" }}>Próximo favorito</Text>. Se actualiza
        cuando marcas ♥ en Hoy.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  lead: {
    fontSize: 13,
    lineHeight: 19,
  },
})

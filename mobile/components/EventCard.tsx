import { useMemo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import type { FeedEvent } from "@/lib/api"
import { formatEventMeta } from "@/lib/api"
import { useTheme } from "@/lib/theme-context"

type Props = {
  event: FeedEvent
  favorited?: boolean
  favoriteBusy?: boolean
  onToggleFavorite?: () => void
  showFavorite?: boolean
}

export function EventCard({
  event,
  favorited = false,
  favoriteBusy = false,
  onToggleFavorite,
  showFavorite = false,
}: Props) {
  const { colors } = useTheme()
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.bgCard,
          borderRadius: 12,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
        },
        row: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 8,
        },
        body: {
          flex: 1,
        },
        title: {
          color: colors.text,
          fontSize: 16,
          fontWeight: "600",
        },
        meta: {
          color: colors.textMuted,
          fontSize: 13,
          marginTop: 4,
        },
        favBtn: {
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.border,
        },
        favActive: {
          backgroundColor: colors.accentBg,
        },
        favIcon: {
          color: colors.accent,
          fontSize: 18,
        },
      }),
    [colors]
  )

  return (
    <View style={styles.card} accessibilityRole="text">
      <View style={styles.row}>
        <View style={styles.body}>
          <Text style={styles.title}>{event.title}</Text>
          {formatEventMeta(event) ? (
            <Text style={styles.meta}>{formatEventMeta(event)}</Text>
          ) : null}
        </View>
        {showFavorite ? (
          <Pressable
            style={[styles.favBtn, favorited ? styles.favActive : null]}
            onPress={onToggleFavorite}
            disabled={favoriteBusy}
            accessibilityRole="button"
            accessibilityLabel={
              favorited ? "Quitar de favoritos" : "Añadir a favoritos"
            }
          >
            <Text style={styles.favIcon}>{favorited ? "♥" : "♡"}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

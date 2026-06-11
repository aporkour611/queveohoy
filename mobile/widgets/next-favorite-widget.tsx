import {
  FlexWidget,
  TextWidget,
  type WidgetInfo,
} from "react-native-android-widget"
import {
  readWidgetSnapshot,
  type WidgetFavoriteSnapshot,
} from "@/lib/widget-snapshot"

function formatWhen(snapshot: WidgetFavoriteSnapshot): string {
  const time = snapshot.time?.trim()
  return time ? `${snapshot.date} · ${time}` : snapshot.date
}

export async function renderNextFavoriteWidget(_info?: WidgetInfo) {
  const snapshot = await readWidgetSnapshot()

  if (!snapshot) {
    return (
      <FlexWidget
        style={{
          height: "match_parent",
          width: "match_parent",
          backgroundColor: "#0a0a0a",
          padding: 16,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <TextWidget
          text="Qué veo hoy"
          style={{ fontSize: 14, color: "#a3e635", fontWeight: "700" }}
        />
        <TextWidget
          text="Marca favoritos en la app"
          style={{ fontSize: 12, color: "#a3a3a3", marginTop: 4 }}
        />
      </FlexWidget>
    )
  }

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: "queveohoy:///(tabs)/favoritos" }}
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#0a0a0a",
        padding: 16,
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <TextWidget
        text="Próximo favorito"
        style={{ fontSize: 12, color: "#a3e635", fontWeight: "700" }}
      />
      <TextWidget
        text={snapshot.title}
        maxLines={2}
        style={{ fontSize: 16, color: "#fafafa", marginTop: 4 }}
      />
      <TextWidget
        text={formatWhen(snapshot)}
        style={{ fontSize: 12, color: "#a3a3a3", marginTop: 4 }}
      />
    </FlexWidget>
  )
}

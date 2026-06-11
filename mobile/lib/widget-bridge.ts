import { Platform } from "react-native"
import { requestWidgetUpdate } from "react-native-android-widget"
import { renderNextFavoriteWidget } from "@/widgets/next-favorite-widget"

export async function refreshAndroidHomeWidget(): Promise<void> {
  if (Platform.OS !== "android") return

  try {
    await requestWidgetUpdate({
      widgetName: "NextFavorite",
      renderWidget: () => renderNextFavoriteWidget(),
    })
  } catch {
    /* Expo Go / simulador sin widget nativo */
  }
}

import { registerWidgetTaskHandler } from "react-native-android-widget"
import { renderNextFavoriteWidget } from "./next-favorite-widget"

registerWidgetTaskHandler(async ({ widgetAction, renderWidget }) => {
  if (widgetAction === "WIDGET_DELETED") return
  renderWidget(await renderNextFavoriteWidget())
})

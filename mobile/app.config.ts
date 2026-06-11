import type { ConfigContext, ExpoConfig } from "expo/config"
import type { WithAndroidWidgetsParams } from "react-native-android-widget"

const widgetConfig: WithAndroidWidgetsParams = {
  widgets: [
    {
      name: "NextFavorite",
      label: "Próximo favorito",
      description: "Tu próximo evento favorito de Qué veo hoy",
      minWidth: "250dp",
      minHeight: "80dp",
      targetCellWidth: 4,
      targetCellHeight: 2,
      updatePeriodMillis: 1_800_000,
    },
  ],
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Qué veo hoy",
  slug: "queveohoy",
  version: "1.3.0",
  orientation: "portrait",
  scheme: "queveohoy",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "es.queveohoy.app",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0a0a0a",
    },
    package: "es.queveohoy.app",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: false,
        data: [
          {
            scheme: "queveohoy",
            host: "auth",
            pathPrefix: "/callback",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
  },
  plugins: [
    "expo-router",
    [
      "expo-notifications",
      {
        color: "#a3e635",
      },
    ],
    ["react-native-android-widget", widgetConfig],
  ],
  experiments: {
    typedRoutes: true,
  },
})

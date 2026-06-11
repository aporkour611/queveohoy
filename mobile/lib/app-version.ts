import Constants from "expo-constants"

export const APP_VERSION =
  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? "0.6.0"

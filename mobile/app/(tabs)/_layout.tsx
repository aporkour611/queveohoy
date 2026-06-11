import { Tabs } from "expo-router"
import { useTheme } from "@/lib/theme-context"

export default function TabsLayout() {
  const { colors } = useTheme()

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBorder,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSubtle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hoy",
          tabBarLabel: "Hoy",
        }}
      />
      <Tabs.Screen
        name="semana"
        options={{
          title: "Semana",
          tabBarLabel: "Semana",
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: "Favoritos",
          tabBarLabel: "Favoritos",
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: "Cuenta",
          tabBarLabel: "Cuenta",
        }}
      />
    </Tabs>
  )
}

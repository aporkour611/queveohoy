import { Tabs } from "expo-router"

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0a0a0a" },
        headerTintColor: "#fafafa",
        tabBarStyle: { backgroundColor: "#0a0a0a", borderTopColor: "#262626" },
        tabBarActiveTintColor: "#a3e635",
        tabBarInactiveTintColor: "#737373",
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

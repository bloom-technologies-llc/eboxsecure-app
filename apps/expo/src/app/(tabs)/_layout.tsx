import * as React from "react";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="(orders)"
        options={{
          title: "Orders",
        }}
      />
      <Tabs.Screen
        name="(notifications)"
        options={{
          title: "Notifications",
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

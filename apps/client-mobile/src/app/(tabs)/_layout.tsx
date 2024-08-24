import * as React from "react";
import { Tabs } from "expo-router";

import { BellIcon, ShoppingCartIcon, UserIcon } from "../icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="(orders)"
        options={{
          title: "Orders",
          tabBarIcon: () => <ShoppingCartIcon />,
        }}
      />
      <Tabs.Screen
        name="(notifications)"
        options={{
          title: "Notifications",
          tabBarIcon: () => <BellIcon />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: () => <UserIcon />,
        }}
      />
    </Tabs>
  );
}

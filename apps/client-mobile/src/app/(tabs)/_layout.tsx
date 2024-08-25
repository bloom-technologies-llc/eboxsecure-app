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
      <Tabs.Screen
        name="(auth)/sign-in"
        options={{
          title: "Sign In",
          tabBarIcon: () => <UserIcon />,
          href: null,
        }}
      />
      <Tabs.Screen
        name="(auth)/sign-up"
        options={{
          title: "Sign Up",
          tabBarIcon: () => <UserIcon />,
          href: null,
        }}
      />
    </Tabs>
  );
}

import * as React from "react";
import { Redirect, Tabs } from "expo-router";
import { BellIcon, ShoppingCartIcon, UserIcon } from "@/components/icons";
import { useAuth } from "@clerk/clerk-expo";
import { MapPin } from "phosphor-react-native";

export default function TabLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }
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
        name="(locations)"
        options={{
          title: "Locations",
          tabBarIcon: ({ color, size }) => (
            <MapPin size={size || 24} color={color || "#000"} />
          ),
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

import { Stack } from "expo-router/stack";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      {/* were able to change the header name dynamically in the future, see here: https://docs.expo.dev/router/advanced/stack/#configure-header-bar */}
      <Stack.Screen
        name="order-detail"
        options={{
          title: "Order details",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="qr-modal"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

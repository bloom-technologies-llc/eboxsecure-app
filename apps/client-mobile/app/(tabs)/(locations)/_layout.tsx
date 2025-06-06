import { Stack } from "expo-router";

export default function LocationsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Locations",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Location Details",
          headerShown: true,
        }}
      />
    </Stack>
  );
}

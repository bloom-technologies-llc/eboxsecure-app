import { Slot, Stack } from "expo-router";

import "../styles.css";

import { SafeAreaView, Text } from "react-native";
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/clerk-expo";

// This is the main layout of the app
// It wraps your pages with the providers they need
function RootLayout() {
  return (
    <ClerkProvider publishableKey="pk_test_bW9kZXJuLWZlbGluZS0xMS5jbGVyay5hY2NvdW50cy5kZXYk">
      <ClerkLoaded>
        <Stack>
          <Slot />
        </Stack>
      </ClerkLoaded>
      <ClerkLoading>
        <SafeAreaView>
          <Text>Loading...</Text>
        </SafeAreaView>
      </ClerkLoading>
    </ClerkProvider>
  );
}

export default RootLayout;

import { Slot, Stack } from "expo-router";

import "../styles.css";

import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";

// This is the main layout of the app
// It wraps your pages with the providers they need
function RootLayout() {
  return (
    <ClerkProvider publishableKey="pk_test_bW9kZXJuLWZlbGluZS0xMS5jbGVyay5hY2NvdW50cy5kZXYk">
      <ClerkLoaded>
        <Stack>
          <Stack.Screen name="index" />
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

export default RootLayout;

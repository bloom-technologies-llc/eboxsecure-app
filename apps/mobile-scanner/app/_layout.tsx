import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

import "react-native-reanimated";
import "../global.css";

import { SessionTimeoutWrapper } from "@/components/SessionTimeoutWrapper";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Set per build profile in eas.json (EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY); falls back to QA.
  return (
    <ClerkProvider
      publishableKey={
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ??
        "pk_test_YmVsb3ZlZC1nbmF0LTM3LmNsZXJrLmFjY291bnRzLmRldiQ"
      }
      tokenCache={tokenCache}
    >
      <SessionTimeoutWrapper>
        <TRPCReactProvider>
          <RootSiblingParent>
            <ClerkLoaded>
              <GestureHandlerRootView>
                <Stack screenOptions={{ headerShown: false }} />
              </GestureHandlerRootView>
            </ClerkLoaded>
          </RootSiblingParent>
        </TRPCReactProvider>
      </SessionTimeoutWrapper>
    </ClerkProvider>
  );
}

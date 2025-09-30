import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

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

  // TODO: add qa/prod publishable keys
  return (
    <ClerkProvider
      publishableKey={"pk_test_YmVsb3ZlZC1nbmF0LTM3LmNsZXJrLmFjY291bnRzLmRldiQ"}
      tokenCache={tokenCache}
    >
      <SessionTimeoutWrapper>
        <TRPCReactProvider>
          <RootSiblingParent>
            <ClerkLoaded>
              <GestureHandlerRootView>
                <BottomSheetModalProvider>
                  <Stack screenOptions={{ headerShown: false }} />
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </ClerkLoaded>
          </RootSiblingParent>
        </TRPCReactProvider>
      </SessionTimeoutWrapper>
    </ClerkProvider>
  );
}

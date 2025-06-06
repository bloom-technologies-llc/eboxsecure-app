import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

import "../global.css";

import { SessionTimeoutWrapper } from "@/components/SessionTimeoutWrapper";
import { SignInCredentialsProvider } from "@/hooks/useSignInCredentials";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={
        "pk_test_bW9kZXJuLWZlbGluZS0xMS5jbGVyay5hY2NvdW50cy5kZXYk"
      }
      tokenCache={tokenCache}
    >
      <SessionTimeoutWrapper>
        <SignInCredentialsProvider>
          <TRPCReactProvider>
            <RootSiblingParent>
              <ClerkLoaded>
                <ThemeProvider
                  value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
                  <GestureHandlerRootView>
                    <BottomSheetModalProvider>
                      <Stack>
                        <Stack.Screen
                          name="index"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(tabs)"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="sign-in"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen name="+not-found" />
                      </Stack>
                    </BottomSheetModalProvider>
                  </GestureHandlerRootView>
                </ThemeProvider>
              </ClerkLoaded>
            </RootSiblingParent>
          </TRPCReactProvider>
        </SignInCredentialsProvider>
      </SessionTimeoutWrapper>
    </ClerkProvider>
  );
}

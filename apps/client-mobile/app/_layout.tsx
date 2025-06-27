import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StripeProvider } from "@stripe/stripe-react-native";

import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

import "../global.css";

import { SessionTimeoutWrapper } from "@/components/SessionTimeoutWrapper";
import { SignInCredentialsProvider } from "@/hooks/useSignInCredentials";

export default function RootLayout() {
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
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
        merchantIdentifier="merchant.com.eboxsecure.eboxsecureclient"
      >
        <SessionTimeoutWrapper>
          <SignInCredentialsProvider>
            <TRPCReactProvider>
              <RootSiblingParent>
                <ClerkLoaded>
                  {/* <ThemeProvider
                  value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                > */}
                  <GestureHandlerRootView>
                    <BottomSheetModalProvider>
                      <Stack screenOptions={{ headerShown: false }} />
                    </BottomSheetModalProvider>
                  </GestureHandlerRootView>
                  {/* </ThemeProvider> */}
                </ClerkLoaded>
              </RootSiblingParent>
            </TRPCReactProvider>
          </SignInCredentialsProvider>
        </SessionTimeoutWrapper>
      </StripeProvider>
    </ClerkProvider>
  );
}

import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";

import { TRPCProvider } from "~/utils/api";

import "../styles.css";

import Constants from "expo-constants";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  if (!Constants.expoConfig || !Constants.expoConfig.extra) {
    throw new Error(
      "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in app.config.ts.",
    );
  }
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={Constants.expoConfig?.extra.CLERK_PUBLISHABLE_KEY}
    >
      <TRPCProvider>
        <ClerkLoaded>
          <Slot />
        </ClerkLoaded>
      </TRPCProvider>
    </ClerkProvider>
  );
}

{
  /*
  const { colorScheme } = useColorScheme();
          The Stack component displays the current page.
          It also allows you to configure your screens 
        */
}
{
  /* <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#f472b6",
          },
          contentStyle: {
            backgroundColor: colorScheme == "dark" ? "#09090B" : "#FFFFFF",
          },
        }}
      /> */
}

// <StatusBar />

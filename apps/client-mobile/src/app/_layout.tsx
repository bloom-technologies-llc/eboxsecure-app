import { Stack, useNavigationContainerRef } from "expo-router";

import "../styles.css";

import { useEffect } from "react";
import { Text, View } from "react-native";
import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import * as Sentry from "@sentry/react-native";

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
  dsn: "https://4ce0e92499b7c443411b75c2d85f3031@o4507837807919104.ingest.us.sentry.io/4507837818011648",
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  enableNative: true,
  enableNativeCrashHandling: true,
  integrations: [
    new Sentry.ReactNativeTracing({
      // Pass instrumentation to be used as `routingInstrumentation`
      routingInstrumentation,
      enableNativeFramesTracking: !isRunningInExpoGo(),
      // ...
    }),
  ],
});

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      console.log(`Retrieved token for key: ${key}`);
      return item;
    } catch (error) {
      console.error("SecureStore getToken error:", error);
      Sentry.captureException(error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
      console.log(`Saved token for key: ${key}`);
    } catch (error) {
      console.error("SecureStore saveToken error:", error);
      Sentry.captureException(error);
    }
  },
};

// This is the main layout of the app
// It wraps your pages with the providers they need
function RootLayout() {
  try {
    // Capture the NavigationContainer ref and register it with the instrumentation.
    const ref = useNavigationContainerRef();
    if (!Constants.expoConfig || !Constants.expoConfig.extra) {
      Sentry.captureMessage("missing expo configuration key");
      throw new Error("Missing Expo configuration.");
    }
    if (!Constants.expoConfig.extra.CLERK_PUBLISHABLE_KEY) {
      Sentry.captureMessage("missing publishable key");
      throw new Error(
        "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in app.config.ts.",
      );
    }
    useEffect(() => {
      if (ref) {
        routingInstrumentation.registerNavigationContainer(ref);
      }
    }, [ref]);

    return (
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey={Constants.expoConfig.extra.CLERK_PUBLISHABLE_KEY}
      >
        <ClerkLoaded>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ClerkLoaded>
      </ClerkProvider>
    );
  } catch (error) {
    Sentry.captureException(error);
    console.error("RootLayout Error:", error);
    return <ErrorFallback error={error} />;
  }
}

function ErrorFallback({ error }: { error: any }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Something went wrong:</Text>
      <Text>{error.toString()}</Text>
    </View>
  );
}

export default Sentry.wrap(RootLayout);

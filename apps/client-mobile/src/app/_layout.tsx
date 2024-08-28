import { Stack, useNavigationContainerRef } from "expo-router";

import "../styles.css";

import { useEffect } from "react";
import { Text, View } from "react-native";
import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
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

// This is the main layout of the app
// It wraps your pages with the providers they need
function RootLayout() {
  try {
    // Capture the NavigationContainer ref and register it with the instrumentation.
    const ref = useNavigationContainerRef();
    if (!Constants.expoConfig || !Constants.expoConfig.extra) {
      Sentry.captureMessage("missing expo configuration key");
      // throw new Error("Missing Expo configuration.");
    }
    if (!Constants?.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY) {
      Sentry.captureMessage("missing publishable key");
      // throw new Error(
      //   "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in app.config.ts.",
      // );
    }
    useEffect(() => {
      if (ref) {
        routingInstrumentation.registerNavigationContainer(ref);
      }
    }, [ref]);

    return (
      <Stack>
        publishable key: {Constants?.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
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

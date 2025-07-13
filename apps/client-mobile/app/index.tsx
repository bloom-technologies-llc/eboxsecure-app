import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useOnboardingStatus } from "@/hooks/useOnboarding";
import { useAuth } from "@clerk/clerk-expo";

export default function Page() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const { isOnboardingComplete, isLoading: isOnboardingLoading } =
    useOnboardingStatus();

  // Show loading while Clerk is initializing or onboarding status is loading
  if (!isLoaded || isOnboardingLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Use isSignedIn instead of just userId for more reliable state
  if (isSignedIn && userId) {
    // Check if onboarding is complete
    if (isOnboardingComplete) {
      return <Redirect href="/(tabs)/(notifications)" />;
    } else {
      return <Redirect href="/onboarding" />;
    }
  }

  return <Redirect href="/sign-in" />;
}

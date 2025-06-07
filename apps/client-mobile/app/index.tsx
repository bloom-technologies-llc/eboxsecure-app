import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function Page() {
  const { userId, isLoaded, isSignedIn } = useAuth();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Use isSignedIn instead of just userId for more reliable state
  if (isSignedIn && userId) {
    return <Redirect href="/(tabs)/(notifications)" />;
  }
  return <Redirect href="/sign-in" />;
}

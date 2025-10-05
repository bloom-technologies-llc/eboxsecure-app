import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Redirect, router } from "expo-router";
import logo from "@/assets/images/logos/eboxsecure-logo.png";
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

  // Redirect to sign-in if not authenticated
  if (!isSignedIn || !userId) {
    return <Redirect href="/sign-in" />;
  }

  // Main app content - simple single page
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <Image
          source={logo}
          style={{ width: 169, height: 120, backgroundColor: "transparent" }}
        />
        <Text className="mt-8 text-2xl font-bold text-gray-900">
          EboxSecure Mobile Scanner
        </Text>
        <Text className="mt-4 text-center text-base text-gray-600">
          Welcome to the mobile scanner application
        </Text>
        <View className="mt-8 w-full max-w-sm">
          <TouchableOpacity
            className="rounded-lg bg-blue-500 px-6 py-3"
            onPress={() => router.push("/scanner")}
          >
            <Text className="text-center font-semibold text-white">
              Open Scanner
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
import { ChartBar, Package, Scan } from "phosphor-react-native";

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

  // Main app content
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 p-6">
        {/* Header Section */}
        <View className="items-center pb-8 pt-4">
          <Image
            source={logo}
            style={{ width: 120, height: 85, backgroundColor: "transparent" }}
          />
          <Text className="mt-4 text-2xl font-bold text-slate-900">
            Package Label Scanner
          </Text>
          <Text className="mt-1 text-sm text-slate-600">
            Package Management System
          </Text>
        </View>

        {/* Quick Actions Grid */}
        <View className="flex-1">
          {/* <Text className="mb-4 text-base font-semibold text-slate-900">
            Quick Actions
          </Text> */}

          <View className="gap-4">
            {/* Main Scanner Button */}
            <TouchableOpacity
              className="rounded-2xl bg-blue-600 p-6 shadow-lg"
              onPress={() => router.push("/scanner")}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <View className="rounded-full bg-white/20 p-3">
                  <Scan size={32} color="#ffffff" weight="bold" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-xl font-bold text-white">
                    Scan Shipping Label
                  </Text>
                  <Text className="mt-1 text-sm text-blue-100">
                    Capture and process package labels
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Stats Cards */}
            {/* <View className="flex-row gap-4">
              <View className="flex-1 rounded-xl bg-white p-4 shadow-sm">
                <View className="self-start rounded-full bg-green-100 p-2">
                  <Package size={24} color="#16a34a" weight="bold" />
                </View>
                <Text className="mt-3 text-2xl font-bold text-slate-900">
                  --
                </Text>
                <Text className="text-xs text-slate-600">Scans Today</Text>
              </View>

              <View className="flex-1 rounded-xl bg-white p-4 shadow-sm">
                <View className="self-start rounded-full bg-purple-100 p-2">
                  <ChartBar size={24} color="#9333ea" weight="bold" />
                </View>
                <Text className="mt-3 text-2xl font-bold text-slate-900">
                  --
                </Text>
                <Text className="text-xs text-slate-600">This Week</Text>
              </View>
            </View> */}
          </View>
        </View>

        {/* Footer Info */}
        <View className="pb-2 pt-4">
          <Text className="text-center text-xs text-slate-500">
            EboxSecure Admin Portal • Internal Use Only
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

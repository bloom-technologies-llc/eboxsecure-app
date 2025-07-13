import { useCallback } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useOnboardingStatus } from "@/hooks/useOnboarding";
import { useAuth, useUser } from "@clerk/clerk-expo";

export default function Page() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { resetOnboarding } = useOnboardingStatus();
  const router = useRouter();

  const onLogOut = async () => {
    await signOut();
  };

  const handleResetOnboarding = useCallback(async () => {
    Alert.alert(
      "Reset Onboarding",
      "This will reset your onboarding progress and take you back to the onboarding flow. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetOnboarding();
            router.replace("/onboarding");
          },
        },
      ],
    );
  }, [resetOnboarding, router]);

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <Text className="mx-4 my-4 text-2xl font-medium">Profile</Text>

      <View>
        <View className="flex flex-row justify-between border border-[#e4e4e7] px-6 py-5">
          <Text className="text-[#333333]">Email</Text>
          <Text className="text-[#333333]">
            {user.primaryEmailAddress?.emailAddress ?? "-"}
          </Text>
        </View>

        <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
          <Text className="text-[#333333]">Phone</Text>
          <Text className="text-[#333333]">
            {user.primaryPhoneNumber?.phoneNumber ?? "-"}
          </Text>
        </View>
      </View>

      <View className="h-2 bg-[#e4e4e7]"></View>

      <View className=" flex flex-row justify-between border border-[#e4e4e7]">
        <Link
          href="/(tabs)/(profile)/manage-security"
          className="w-full px-6 py-5"
        >
          <Text className="text-[#333333]">Manage security</Text>
        </Link>
      </View>

      <View className=" flex flex-row justify-between border border-t-0 border-[#e4e4e7]">
        <Link
          href="/(tabs)/(profile)/trusted-contacts"
          className="w-full px-6 py-5"
        >
          <Text className="text-[#333333]">Trusted Contacts</Text>
        </Link>
      </View>

      <View className="h-2 bg-[#e4e4e7]"></View>

      <View>
        <View className=" flex flex-row justify-between border border-[#e4e4e7] px-6 py-5">
          <Text className="text-[#333333]">Subscription</Text>
        </View>
        <View className=" flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
          <Text className="text-[#333333]">Purchase history</Text>
        </View>
        <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
          <Pressable onPress={async () => onLogOut()}>
            <Text className="text-[#333333]">Log out</Text>
          </Pressable>
        </View>
      </View>

      <View className="h-2 bg-[#e4e4e7]"></View>

      {/* App Settings Section */}
      <View>
        <View className="bg-gray-50 px-6 py-3">
          <Text className="text-sm font-medium text-gray-600">
            App Settings
          </Text>
        </View>
        <View className="flex flex-row justify-between border border-[#e4e4e7] px-6 py-5">
          <Pressable onPress={handleResetOnboarding}>
            <Text>Reset Onboarding</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

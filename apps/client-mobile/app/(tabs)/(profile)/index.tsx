import React from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { api } from "@/trpc/react";
import { showToast } from "@/utils/toast";
import { useAuth, useUser } from "@clerk/clerk-expo";

export default function Page() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { data: plan } = api.subscription.getCurrentPlan.useQuery();

  // Customer-facing plan names (the enum values are internal).
  const planNames: Record<string, string> = {
    BASIC: "Basic",
    BASIC_PLUS: "Basic+",
    PREMIUM: "Premium",
    BUSINESS_PRO: "Business Pro",
  };

  // Account deletion is a request: it is emailed to EboxSecure and fulfilled
  // by hand, and the account stays active until then.
  const { mutate: requestAccountDeletion, isPending: requestingDeletion } =
    api.user.requestAccountDeletion.useMutation({
      onSuccess: () =>
        Alert.alert(
          "Deletion request sent",
          "We have received your request. Our team will email you to confirm once your account has been deleted. Your account stays active until then.",
        ),
      onError: (error) => showToast(error.message, "error"),
    });

  const onRequestAccountDeletion = () => {
    Alert.alert(
      "Request account deletion",
      "This sends a request to EboxSecure to permanently delete your account, cancel your subscription and remove your personal data. Please pick up any packages we are holding for you first.",
      [
        { text: "Keep My Account", style: "cancel" },
        {
          text: "Request Deletion",
          style: "destructive",
          onPress: () => requestAccountDeletion(),
        },
      ],
    );
  };

  const onLogOut = async () => {
    await signOut();
  };
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

      <View className=" flex flex-row justify-between border border-t-0 border-[#e4e4e7]">
        <Link
          href="/(tabs)/(profile)/notification-preferences"
          className="w-full px-6 py-5"
        >
          <Text className="text-[#333333]">Notification Preferences</Text>
        </Link>
      </View>

      <View className="h-2 bg-[#e4e4e7]"></View>

      <View>
        <View className=" flex flex-row justify-between border border-[#e4e4e7] px-6 py-5">
          <Text
            className="text-[#333333]"
            onPress={() =>
              Linking.openURL(
                "https://app.eboxsecure.com/settings/subscription",
              )
            }
          >
            Manage subscription (web only)
          </Text>
          <Text className="text-[#333333]">
            {plan?.plan
              ? (planNames[plan.plan.subscriptionType] ??
                plan.plan.subscriptionType)
              : "-"}
          </Text>
        </View>
        <View className=" flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
          <Text className="text-[#333333]">Purchase history</Text>
        </View>
        <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
          <Pressable onPress={async () => onLogOut()}>
            <Text className="text-[#333333]">Log out</Text>
          </Pressable>
        </View>
        <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
          <Pressable
            onPress={onRequestAccountDeletion}
            disabled={requestingDeletion}
            accessibilityRole="button"
          >
            <Text className="text-[#b91c1c]">
              {requestingDeletion ? "Sending request..." : "Delete account"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useLocalCredentials } from "@clerk/clerk-expo/local-credentials";

export default function Page() {
  const { signOut } = useAuth();
  const { user } = useUser();

  const { clearCredentials } = useLocalCredentials();

  const onLogOut = async () => {
    await clearCredentials();
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

      <View className=" flex flex-row justify-between">
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
    </SafeAreaView>
  );
}

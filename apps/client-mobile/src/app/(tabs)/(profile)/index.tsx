import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";

export default function Page() {
  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <Text className="mx-4 my-4 text-2xl font-medium">Profile</Text>
      <Text>
        publishable key: {Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY}
      </Text>
      <SignedIn>
        <Text>You are signed in</Text>
      </SignedIn>
      <SignedOut>
        <Text>You are signed out</Text>
      </SignedOut>

      <View>
        <View className="flex flex-row justify-between border border-[#e4e4e7] px-6 py-5">
          <Text className="text-[#333333]">Email</Text>
          <Text className="text-[#333333]">john.doe@gmail.com</Text>
        </View>

        <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
          <Text className="text-[#333333]">Phone</Text>
          <Text className="text-[#333333]">123-456-7899</Text>
        </View>

        <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
          <Text className="text-[#333333]">Address</Text>
          <Text className="text-[#333333]">KF-1234556</Text>
        </View>

        <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
          <Text className="text-[#333333]">Driver license</Text>
          <Text className="text-[#333333]">04/02/2001</Text>
        </View>

        <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
          <Text className="text-[#333333]">Birthday</Text>
          <Text className="text-[#333333]">john.doe@gmail.com</Text>
        </View>
      </View>

      <View className="h-2 bg-[#e4e4e7]"></View>

      <View className="my-4 flex flex-row justify-between border border-[#e4e4e7] px-6 py-5">
        <Text className="text-[#333333]">Phone</Text>
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
          <Text className="text-[#333333]">Log out</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

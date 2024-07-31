import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";

export default function Page() {
  const { user } = useUser();

  return (
    <SafeAreaView>
      <View className="mx-4">
        <SignedIn>
          <Text className="mb-4 text-2xl font-medium">Order History</Text>

          <View className="border border-[#e4e4e7] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View className="flex gap-y-3">
                <View className="flex">
                  <Text className="">Ready for pickup</Text>
                  <Text className="text-sm">
                    Delivered to My EBOX location 3
                  </Text>
                </View>
                <Pressable
                  style={{ alignSelf: "flex-start" }}
                  className="rounded-md border border-[#333333] p-2"
                >
                  <Text style={{ alignSelf: "flex-start" }}>View QR Code</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in">
            <Text>Sign In</Text>
          </Link>
          <Link href="/sign-up">
            <Text>Sign Up</Text>
          </Link>
        </SignedOut>
      </View>
    </SafeAreaView>
  );
}

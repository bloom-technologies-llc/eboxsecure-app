import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";

import App from "./qr-modal";
import QRModal from "./qr-modal";

export default function Page() {
  const { user } = useUser();

  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <View>
        <SignedIn>
          <Text className="mx-4 mb-4 text-2xl font-medium">Order History</Text>

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
                <QRModal />
              </View>
            </View>
          </View>

          <View className="border border-t-0 border-[#e4e4e7] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View className="flex gap-y-3">
                <View className="flex">
                  <Text className="">Ready for pickup</Text>
                  <Text className="text-sm">
                    Delivered to My EBOX location 3
                  </Text>
                </View>
                <QRModal />
              </View>
            </View>
          </View>

          <View className="border border-t-0 border-[#e4e4e7] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View className="flex gap-y-3">
                <View className="flex">
                  <Text className="">Ready for pickup</Text>
                  <Text className="text-sm">
                    Delivered to My EBOX location 3
                  </Text>
                </View>
                <QRModal />
              </View>
            </View>
          </View>

          <View className="border border-t-0 border-[#e4e4e7] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View className="flex gap-y-3">
                <View className="flex">
                  <Text className="">Ready for pickup</Text>
                  <Text className="text-sm">
                    Delivered to My EBOX location 3
                  </Text>
                </View>
                <QRModal />
              </View>
            </View>
          </View>

          <View className="border border-t-0 border-[#e4e4e7] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View className="flex gap-y-3">
                <View className="flex">
                  <Text className="">Ready for pickup</Text>
                  <Text className="text-sm">
                    Delivered to My EBOX location 3
                  </Text>
                </View>
                <QRModal />
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

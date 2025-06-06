import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

import QRModal from "./qr-modal";

export default function Page() {
  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <View>
        <Text className="mx-4 my-4 text-2xl font-medium">Order History</Text>

        <Link href={"/(tabs)/(orders)/order-detail"} asChild>
          <Pressable className=" w-full border border-[#e4e4e7] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View className="flex gap-y-3">
                <View className="flex">
                  <Text className="">Ready for pickup</Text>
                  <Text className="text-sm text-[#575959]">
                    Delivered to My EBOX location 3
                  </Text>
                </View>
                <QRModal />
              </View>
            </View>
          </Pressable>
        </Link>

        <Link href={"/(tabs)/(orders)/order-detail"} asChild>
          <Pressable className=" w-full border border-t-0 border-[#e4e4e7] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View className="flex gap-y-3">
                <View className="flex">
                  <Text className="">Ready for pickup</Text>
                  <Text className="text-sm text-[#575959]">
                    Delivered to My EBOX location 3
                  </Text>
                </View>
                <QRModal />
              </View>
            </View>
          </Pressable>
        </Link>

        <Link href={"/(tabs)/(orders)/order-detail"} asChild>
          <Pressable className=" w-full border border-t-0 border-[#e4e4e7] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View className="flex gap-y-3">
                <View className="flex">
                  <Text className="">Ready for pickup</Text>
                  <Text className="text-sm text-[#575959]">
                    Delivered to My EBOX location 3
                  </Text>
                </View>
                <QRModal />
              </View>
            </View>
          </Pressable>
        </Link>

        <Link href={"/(tabs)/(orders)/order-detail"} asChild>
          <Pressable className=" w-full border border-t-0 border-[#e4e4e7] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View className="flex gap-y-3">
                <View className="flex">
                  <Text className="">Ready for pickup</Text>
                  <Text className="text-sm text-[#575959]">
                    Delivered to My EBOX location 3
                  </Text>
                </View>
                <QRModal />
              </View>
            </View>
          </Pressable>
        </Link>

        <Link href={"/(tabs)/(orders)/order-detail"} asChild>
          <Pressable className=" w-full border border-t-0 border-[#e4e4e7] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View className="flex gap-y-3">
                <View className="flex">
                  <Text className="">Ready for pickup</Text>
                  <Text className="text-sm text-[#575959]">
                    Delivered to My EBOX location 3
                  </Text>
                </View>
                <QRModal />
              </View>
            </View>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

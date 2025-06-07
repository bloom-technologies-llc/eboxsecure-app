import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { DoubleCheckIcon } from "@/components/icons";

import QRModal from "../(orders)/qr-modal";

export default function Page() {
  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <View>
        <Text className="mx-4 my-4 text-2xl font-medium">Notifications</Text>

        <View className="flex-row items-center gap-x-2 border border-[#e4e4e7] px-4 py-3">
          <DoubleCheckIcon />
          <Text className=" text-[#333333]">Mark all as read</Text>
        </View>

        <View className="bg-[#e4e4e7] px-4 py-3">
          <Text className=" text-[#575959]">Today</Text>
        </View>

        {/* new Notifications */}
        <Link href={"/(tabs)/(orders)/order-detail"} asChild>
          <Pressable className=" border border-[#e4e4e7] bg-[#F6F9FB] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View style={{ flex: 1 }} className="gap-y-3">
                <View className="flex w-full flex-row justify-between">
                  {/* <Text>Package delivered</Text> */}
                  <Text className="">Package delivered</Text>
                  <Text className="text-sm">Today, 9:30am</Text>
                </View>

                <View className=" gap-y-1">
                  <Text className="text-sm text-[#575959]">
                    Delivered to My EBOX location 3
                  </Text>

                  <QRModal />
                </View>
              </View>
            </View>
          </Pressable>
        </Link>

        {/* new Notifications */}
        <Link href={"/(tabs)/(orders)/order-detail"} asChild>
          <Pressable className=" border border-[#e4e4e7] bg-[#F6F9FB] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View style={{ flex: 1 }} className="gap-y-3">
                <View className="flex w-full flex-row justify-between">
                  {/* <Text>Package delivered</Text> */}
                  <Text className="">Package delivered</Text>
                  <Text className="text-sm">Today, 9:30am</Text>
                </View>

                <View className=" gap-y-1">
                  <Text className="text-sm text-[#575959]">
                    Delivered to My EBOX location 3
                  </Text>

                  <QRModal />
                </View>
              </View>
            </View>
          </Pressable>
        </Link>

        <View className="bg-[#e4e4e7] px-4 py-3">
          <Text className=" text-[#575959]">Previous</Text>
        </View>

        {/* old Notifications */}
        <Link href={"/(tabs)/(orders)/order-detail"} asChild>
          <Pressable className=" border border-[#e4e4e7] bg-[#ffffff] p-4">
            <View className="flex flex-row items-center gap-x-2">
              <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
              <View style={{ flex: 1 }} className="gap-y-3">
                <View className="flex w-full flex-row justify-between">
                  {/* <Text>Package delivered</Text> */}
                  <Text className="">Package delivered</Text>
                  <Text className="text-sm">Today, 9:30am</Text>
                </View>

                <View className=" gap-y-1">
                  <Text className="text-sm text-[#575959]">
                    Delivered to My EBOX location 3
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

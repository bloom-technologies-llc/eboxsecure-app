import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import QRModal from "../(orders)/qr-modal";

export default function Page() {
  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <View>
        <Text className="mx-4 mb-4 text-2xl font-medium">Notifications</Text>

        <View className="border border-[#e4e4e7] px-4 py-3">
          <Text className="text-sm text-[#333333]">Mark all as read</Text>
        </View>

        <View className="bg-[#e4e4e7] px-4 py-3">
          <Text className="text-sm text-[#575959]">Today</Text>
        </View>

        {/* new Notifications */}
        <View className=" border border-[#e4e4e7] bg-[#F6F9FB] p-4">
          <View className="flex flex-row items-center gap-x-2">
            <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
            <View style={{ flex: 1 }} className="gap-y-3">
              <View className="flex w-full flex-row justify-between">
                {/* <Text>Package delivered</Text> */}
                <Text className="">Package delivered</Text>
                <Text className="text-sm">Today, 9:30am</Text>
              </View>

              <View className=" gap-y-1">
                <Text className="text-sm">Delivered to My EBOX location 3</Text>

                <QRModal />
              </View>
            </View>
          </View>
        </View>

        {/* new Notifications */}
        <View className=" border border-[#e4e4e7] bg-[#F6F9FB] p-4">
          <View className="flex flex-row items-center gap-x-2">
            <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
            <View style={{ flex: 1 }} className="gap-y-3">
              <View className="flex w-full flex-row justify-between">
                {/* <Text>Package delivered</Text> */}
                <Text className="">Package delivered</Text>
                <Text className="text-sm">Today, 9:30am</Text>
              </View>

              <View className=" gap-y-1">
                <Text className="text-sm">Delivered to My EBOX location 3</Text>

                <QRModal />
              </View>
            </View>
          </View>
        </View>

        <View className="bg-[#e4e4e7] px-4 py-3">
          <Text className="text-sm text-[#575959]">Previous</Text>
        </View>

        {/* old Notifications */}
        <View className=" border border-[#e4e4e7] bg-[#ffffff] p-4">
          <View className="flex flex-row items-center gap-x-2">
            <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
            <View style={{ flex: 1 }} className="gap-y-3">
              <View className="flex w-full flex-row justify-between">
                {/* <Text>Package delivered</Text> */}
                <Text className="">Package delivered</Text>
                <Text className="text-sm">Today, 9:30am</Text>
              </View>

              <View className=" gap-y-1">
                <Text className="text-sm">Delivered to My EBOX location 3</Text>

                <QRModal />
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

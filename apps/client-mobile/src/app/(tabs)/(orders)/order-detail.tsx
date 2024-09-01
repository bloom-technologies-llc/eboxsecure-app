import { ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";

export default function Page() {
  return (
    <ScrollView style={{ flex: 1 }} className="bg-white">
      <View className="my-12 flex gap-y-4 bg-white">
        {/* timeseries status */}
        <View className="flex-row">
          <View className="flex-1">
            <View className="items-center">
              <View className="flex-row items-center">
                <View className="invisible h-px flex-1 bg-slate-500 "></View>

                <View className="z-10 h-5 w-5 shrink-0 flex-row items-center justify-center rounded-full bg-blue-100 ring-0 ring-white">
                  <View className="z-11 h-2.5 w-2.5 shrink-0 flex-row items-center justify-center rounded-full bg-blue-300 ring-0 ring-white" />
                </View>
                <View className="h-px flex-1 bg-slate-500"></View>
              </View>
            </View>

            <View className="mt-3 items-center">
              <Text className="text-sm font-semibold text-gray-900 ">
                Ordered
              </Text>
            </View>
          </View>

          <View className=" flex-1">
            <View className="items-center">
              <View className="flex-row items-center">
                <View className="h-px flex-1 bg-slate-500"></View>

                <View className="z-10 h-5 w-5 shrink-0 flex-row items-center justify-center rounded-full bg-blue-100 ring-0 ring-white">
                  <View className="z-11 h-2.5 w-2.5 shrink-0 flex-row items-center justify-center rounded-full bg-blue-300 ring-0 ring-white" />
                </View>
                <View className="h-px flex-1 bg-slate-500 "></View>
              </View>
            </View>

            <View className="mt-3 items-center">
              <Text className="text-sm font-semibold text-gray-900 ">
                Shipped
              </Text>
            </View>
          </View>

          <View className=" flex-1">
            <View className="items-center">
              <View className="flex-row items-center">
                <View className="h-px flex-1 bg-slate-500 "></View>

                <View className="z-10 h-5 w-5 shrink-0 flex-row items-center justify-center rounded-full bg-blue-100 ring-0 ring-white">
                  <View className="z-11 h-2.5 w-2.5 shrink-0 flex-row items-center justify-center rounded-full bg-blue-300 ring-0 ring-white" />
                </View>
                <View className="h-px flex-1 bg-slate-500"></View>
              </View>
            </View>

            <View className="mt-3 items-center">
              <Text className="text-sm font-semibold text-gray-900 ">
                Delivered
              </Text>
            </View>
          </View>

          <View className="flex-1">
            <View className="items-center">
              <View className="flex-row items-center">
                <View className="h-px flex-1 bg-slate-500"></View>

                <View className="z-10 h-5 w-5 shrink-0 flex-row items-center justify-center rounded-full bg-blue-100 ring-0 ring-white">
                  <View className="z-11 h-2.5 w-2.5 shrink-0 flex-row items-center justify-center rounded-full bg-blue-300 ring-0 ring-white" />
                </View>

                <View className="invisible h-px flex-1 bg-slate-500"></View>
              </View>
            </View>
            <View className="mt-3 items-center">
              <Text className="text-sm font-semibold text-gray-900 ">
                Picked up
              </Text>
            </View>
          </View>
        </View>

        <View className="my-4 border border-[#e4e4e7] p-4">
          <View className="flex flex-row items-center gap-x-3">
            <View className="h-24 w-24 rounded-lg bg-slate-300"></View>
            <View className="flex gap-y-3">
              <View className="flex gap-y-2">
                <Text className="">Apple Watch Ultra 2</Text>
                <Text className="text-sm">$248.00</Text>
              </View>
            </View>
          </View>
        </View>

        {/* order information */}
        <View className="flex border border-x-0 border-y-8 border-[#e4e4e7]">
          <Text className="mx-6 py-4 text-xl font-medium text-[#333333]">
            At a glance
          </Text>

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
        </View>

        <View
          style={{ justifyContent: "center" }}
          className="mx-6 flex justify-center"
        >
          <View className="flex gap-y-2">
            <View className="mx-auto h-60 w-8/12">
              <Image
                style={{ width: "100%", flex: 1 }}
                // couldnt get image to load in so...
                source="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/440px-QR_code_for_mobile_English_Wikipedia.svg.png"
                contentFit="cover"
              />
            </View>
            <Text className="text-center text-xl">Scan QR code</Text>
            <Text className="text-center text-[#575959]">
              Once you arrive at your EBOX location, show the agent your code to
              pickup your package
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

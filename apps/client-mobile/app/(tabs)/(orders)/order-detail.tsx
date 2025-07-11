import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api } from "@/trpc/react";
import QRCode from "react-qr-code";

export default function Page() {
  const { id } = useLocalSearchParams();
  const orderId = Number(id);
  const {
    data: order,
    isLoading: loadingOrder,
    error: orderError,
  } = api.order.get.useQuery(
    { orderId },
    {
      enabled: Boolean(orderId),
    },
  );

  const {
    data: qrCode,
    isLoading: loadingQrCode,
    error: qrCodeError,
  } = api.auth.getAuthorizedPickupToken.useQuery(
    { orderId },
    {
      enabled: Boolean(orderId),
      refetchInterval: 1000 * 60 * 15,
    },
  );

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

        {/* Order Summary */}
        <View className="my-4 border border-[#e4e4e7] p-4">
          <View className="flex flex-row items-center gap-x-3">
            <View className="h-24 w-24 rounded-lg bg-slate-300" />
            <View className="flex gap-y-3">
              <Text className="">Apple Watch Ultra 2</Text>
              <Text className="text-sm">$248.00</Text>
            </View>
          </View>
        </View>

        {/* Order Information */}
        <View className="flex border border-x-0 border-y-8 border-[#e4e4e7]">
          <Text className="mx-6 py-4 text-xl font-medium text-[#333333]">
            At a glance
          </Text>

          <Text>{orderError?.message ?? ""}</Text>

          {loadingOrder ? (
            <ActivityIndicator className="my-4" />
          ) : orderError ? (
            <Text className="mx-6 text-red-500">
              Failed to load order details.
            </Text>
          ) : order ? (
            <View>
              <View className="flex flex-row justify-between border border-[#e4e4e7] px-6 py-5">
                <Text className="text-[#333333]">Email</Text>
                <Text className="text-[#333333]">{order.customer.email}</Text>
              </View>

              <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
                <Text className="text-[#333333]">Phone</Text>
                <Text className="text-[#333333]">
                  {order.customer.phoneNumber}
                </Text>
              </View>

              <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
                <Text className="text-[#333333]">Shipping Address</Text>
                <Text className="text-[#333333]">
                  {order.shippedLocation.address ?? "—"}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* QR Code Section */}
        <View className="mx-6 flex justify-center">
          <View className="flex gap-y-2">
            {loadingQrCode ? (
              <ActivityIndicator className="my-4" />
            ) : qrCodeError ? (
              <Text className="text-center text-red-500">
                Failed to load QR code.
              </Text>
            ) : qrCode ? (
              <>
                <View className="mx-auto flex-1">
                  <QRCode value={qrCode} />
                </View>
                <Text className="text-center text-xl">Scan QR code</Text>
                <Text className="text-center text-[#575959]">
                  Once you arrive at your EBOX location, show the agent your
                  code to pickup your package.
                </Text>
              </>
            ) : (
              <Text className="text-center text-gray-500">
                QR code not available yet.
              </Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

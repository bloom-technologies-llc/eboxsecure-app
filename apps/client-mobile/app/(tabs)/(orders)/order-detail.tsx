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
      enabled: Boolean(order && !order.pickedUpAt),
      refetchInterval: 1000 * 60 * 15,
    },
  );

  return (
    <ScrollView style={{ flex: 1 }} className="bg-white">
      <View className="my-12 flex gap-y-4 bg-white">
        {/* timeseries status */}
        <View className="flex-row">
          {[
            { label: "Ordered", active: true },
            { label: "Processed", active: !!order?.processedAt },
            { label: "Delivered", active: !!order?.deliveredDate },
            { label: "Picked up", active: !!order?.pickedUpAt },
          ].map((step, idx, arr) => {
            const isLast = idx === arr.length - 1;
            return (
              <View key={step.label} className="flex-1">
                <View className="items-center">
                  <View className="flex-row items-center">
                    <View
                      className={`${idx === 0 ? "invisible" : ""} h-px flex-1 ${step.active ? "bg-blue-500" : "bg-slate-300"}`}
                    />
                    <View
                      className={`z-10 h-5 w-5 shrink-0 flex-row items-center justify-center rounded-full ${step.active ? "bg-blue-100" : "bg-slate-200"} ring-0 ring-white`}
                    >
                      <View
                        className={`z-11 h-2.5 w-2.5 shrink-0 flex-row items-center justify-center rounded-full ${step.active ? "bg-blue-500" : "bg-slate-400"} ring-0 ring-white`}
                      />
                    </View>
                    <View
                      className={`${isLast ? "invisible" : ""} h-px flex-1 ${arr[idx + 1]?.active ? "bg-blue-500" : "bg-slate-300"}`}
                    />
                  </View>
                </View>
                <View className="mt-3 items-center">
                  <Text className="text-sm font-semibold text-gray-900">
                    {step.label}
                  </Text>
                </View>
              </View>
            );
          })}
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
                <Text className="text-[#333333]">Order ID #</Text>
                <Text className="text-[#333333]">{order.id}</Text>
              </View>
              <View className="flex flex-row justify-between border border-[#e4e4e7] px-6 py-5">
                <Text className="text-[#333333]">Total Price</Text>
                <Text className="text-[#333333]">${order.total}</Text>
              </View>
              <View className="flex flex-row justify-between border border-[#e4e4e7] px-6 py-5">
                <Text className="text-[#333333]">Customer Email</Text>
                <Text className="text-[#333333]">{order.customer.email}</Text>
              </View>

              <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
                <Text className="text-[#333333]">Customer Phone Number</Text>
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
            {order?.pickedUpAt ? (
              <View className="items-center">
                <Text className="text-center text-xl font-semibold text-[#333]">
                  Order already picked up
                </Text>
                <Text className="text-center text-[#575959]">
                  This order has been picked up and no longer requires a QR
                  code.
                </Text>
              </View>
            ) : loadingQrCode ? (
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

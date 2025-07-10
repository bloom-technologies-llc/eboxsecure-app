import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { api } from "@/trpc/react";

import { RouterOutput } from "@ebox/client-api";

import QRModal from "./qr-modal";

type OrderView = RouterOutput["order"]["getAllOrders"][number];

const getShippingStatus = (order: OrderView) => {
  if (order.pickedUpAt) return "Picked Up";
  if (order.deliveredDate) return "Delivered";
  if (order.processedAt) return "Processed";
  return "Order";
};

const OrderCard = ({ order }: { order: OrderView }) => {
  const { pickedUpAt, deliveredDate, shippedLocation } = order;

  return (
    <Link href={"/(tabs)/(orders)/order-detail"} asChild>
      <Pressable className="w-full border border-b-0 border-[#e4e4e7] bg-white p-4">
        <View className="flex flex-row items-center gap-x-4">
          <View className="h-24 w-24 rounded-lg bg-slate-300" />
          <View className="flex flex-1 gap-y-2">
            <Text className="text-base font-semibold text-gray-800">
              Order #{order.id}
            </Text>
            <Text className="text-sm text-gray-600">
              {getShippingStatus(order)}
            </Text>
            {deliveredDate && (
              <Text className="text-sm text-[#575959]">
                Delivered to {shippedLocation.name}
              </Text>
            )}
            {deliveredDate && !pickedUpAt ? (
              <QRModal />
            ) : pickedUpAt ? (
              <Text className="text-xs text-green-600">Already Picked Up</Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

export default function Page() {
  const { data: orders, isLoading, error } = api.order.getAllOrders.useQuery();

  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <View>
        <Text className="mb-4 text-2xl font-semibold">Order History</Text>

        {isLoading && <ActivityIndicator size="large" color="#000" />}
        {error && <Text className="text-red-500">Failed to load orders.</Text>}

        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <OrderCard order={item} />}
          ItemSeparatorComponent={() => (
            <View className="h-[1px] bg-gray-200" />
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-500">No orders found.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

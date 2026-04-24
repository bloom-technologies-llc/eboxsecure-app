import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { api } from "@/trpc/react";

export default function VirtualAddressBanner() {
  const [isCreating, setIsCreating] = useState(false);
  const { data: virtualAddress, isLoading } =
    api.user.getVirtualAddress.useQuery();
  const utils = api.useUtils();

  const createVirtualAddress = api.user.createVirtualAddress.useMutation({
    onMutate: () => {
      setIsCreating(true);
    },
    onSuccess: () => {
      void utils.user.getVirtualAddress.invalidate();
    },
    onSettled: () => {
      setIsCreating(false);
    },
  });

  if (isLoading) {
    return (
      <View className="mb-4 rounded-lg border border-gray-200 bg-blue-50 p-4">
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }

  if (!virtualAddress) {
    return (
      <View className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Text className="mb-1 text-base font-semibold text-blue-900">
          You have not yet created your virtual address. Create one now
        </Text>
        <Text className="mb-3 text-sm text-blue-700">
          Virtual addresses allow you to send packages directly to EboxSecure
          facilities without the need for one of our integrations. Use this
          virtual address in the secondary address of the shipping details.
        </Text>
        <Pressable
          className="rounded-md bg-blue-600 px-4 py-2"
          onPress={() => createVirtualAddress.mutate()}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-center font-semibold text-white">
              Create Now
            </Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
      <Text className="mb-1 text-base font-semibold text-green-900">
        Your Virtual Address
      </Text>
      <View className="mb-3 rounded-md bg-white p-3">
        <Text className="text-center text-lg font-bold text-gray-900">
          {virtualAddress}
        </Text>
      </View>
      <Text className="mb-2 text-sm font-medium text-green-800">
        Example Usage:
      </Text>
      <View className="rounded-md bg-white p-3">
        <Text className="text-xs text-gray-700">
          <Text className="font-semibold">Primary Address:{"\n"}</Text>
          John Doe{"\n"}
          123 Main Street{"\n"}
          Anytown, ST 12345
        </Text>
        <Text className="mt-2 text-xs text-gray-700">
          <Text className="font-semibold">Secondary Address:{"\n"}</Text>
          {virtualAddress}
        </Text>
      </View>
    </View>
  );
}

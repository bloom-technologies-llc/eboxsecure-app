import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { MapPin } from "phosphor-react-native";

import { showToast } from "@/utils/toast";

interface LocationInfoProps {
  address: string;
  name: string;
  className?: string;
}

export function LocationInfo({
  address,
  name,
  className = "",
}: LocationInfoProps) {
  const handleOpenMaps = async () => {
    try {
      const url = `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        showToast("Unable to open maps", "error");
      }
    } catch (error) {
      showToast("Error opening maps", "error");
    }
  };

  return (
    <View className={`rounded-lg bg-gray-100 p-4 ${className}`}>
      <View className="mb-2 flex-row items-center">
        <MapPin size={20} color="#3b82f6" />
        <Text className="ml-2 text-lg font-semibold text-gray-900">{name}</Text>
      </View>
      <Text className="ml-7 text-gray-600">{address}</Text>

      <TouchableOpacity
        onPress={handleOpenMaps}
        className="mt-3 rounded-lg bg-blue-50 p-3"
        activeOpacity={0.7}
      >
        <Text className="text-center text-sm text-blue-700">
          📍 Location Address
        </Text>
        <Text className="mt-1 text-center text-xs text-blue-600">
          Tap to open in Google Maps
        </Text>
      </TouchableOpacity>
    </View>
  );
}

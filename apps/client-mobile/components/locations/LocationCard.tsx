import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Package } from "phosphor-react-native";

import { Badge } from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
import { FavoriteButton } from "./FavoriteButton";

interface LocationCardProps {
  location: {
    id: number;
    name: string;
    address: string;
    storageCapacity: number;
    locationType: string;
    isFavorited: boolean;
    isPrimary?: boolean;
  };
  onToggleFavorite: (locationId: number) => void;
  isToggling: boolean;
  showFavoriteButton?: boolean;
}

export function LocationCard({
  location,
  onToggleFavorite,
  isToggling,
  showFavoriteButton = true,
}: LocationCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(tabs)/(locations)/${location.id}` as any);
  };

  const handleFavoritePress = () => {
    onToggleFavorite(location.id);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card variant={location.isPrimary ? "primary" : "default"}>
        <CardContent>
          <View className="flex-row items-start justify-between">
            <View className="mr-3 flex-1">
              <View className="mb-1 flex-row items-center">
                <Text
                  className="flex-1 text-lg font-semibold text-gray-900"
                  numberOfLines={1}
                >
                  {location.name}
                </Text>
                {location.isPrimary && (
                  <Badge variant="secondary">Primary</Badge>
                )}
              </View>

              <View className="mb-2 flex-row items-center">
                <MapPin size={14} color="#6b7280" />
                <Text
                  className="ml-1 flex-1 text-sm text-gray-600"
                  numberOfLines={2}
                >
                  {location.address}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Package size={14} color="#3b82f6" />
                <Text className="ml-1 text-sm text-gray-600">
                  {location.storageCapacity} packages
                </Text>
                <Text className="ml-2 text-sm text-gray-400">
                  • {location.locationType}
                </Text>
              </View>
            </View>

            {showFavoriteButton && (
              <TouchableOpacity
                onPress={handleFavoritePress}
                activeOpacity={0.7}
              >
                <FavoriteButton
                  isFavorited={location.isFavorited}
                  isLoading={isToggling}
                  onToggle={() => {}}
                  variant="small"
                />
              </TouchableOpacity>
            )}
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}

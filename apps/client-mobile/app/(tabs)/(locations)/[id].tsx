import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import Toast from "react-native-root-toast";
import { useLocalSearchParams } from "expo-router";
import { LocationInfo } from "@/components/locations/LocationInfo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import {
  Clock,
  CurrencyDollar,
  Heart,
  MapPin,
  Package,
} from "phosphor-react-native";

export default function LocationDetailPage() {
  const params = useLocalSearchParams();
  const locationId = parseInt(params.id as string);

  // Helper function to show toast notifications
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    Toast.show(message, {
      duration: 3000,
      position: Toast.positions.TOP,
      backgroundColor: type === "error" ? "#ef4444" : "#22c55e",
      textColor: "#ffffff",
      shadow: true,
      animation: true,
    });
  };

  const {
    data: location,
    isLoading,
    error,
    refetch,
  } = api.favorites.getLocationDetails.useQuery(
    { locationId },
    { enabled: !isNaN(locationId) },
  );

  const addFavoriteMutation = api.favorites.addFavorite.useMutation({
    onSuccess: () => {
      showToast("Location added to favorites!");
      refetch();
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });

  const removeFavoriteMutation = api.favorites.removeFavorite.useMutation({
    onSuccess: () => {
      showToast("Location removed from favorites!");
      refetch();
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });

  const setPrimaryMutation = api.favorites.setPrimary.useMutation({
    onSuccess: () => {
      showToast("Set as primary location!");
      refetch();
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });

  if (isNaN(locationId)) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="mb-2 text-xl font-bold text-red-500">
          Invalid Location
        </Text>
        <Text className="text-center text-gray-600">
          The location ID provided is not valid.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (error || !location) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="mb-2 text-xl font-bold text-red-500">
          Location Not Found
        </Text>
        <Text className="text-center text-gray-600">
          The location you're looking for doesn't exist or you don't have access
          to it.
        </Text>
      </View>
    );
  }

  const handleAddFavorite = () => {
    addFavoriteMutation.mutate({ locationId });
  };

  const handleRemoveFavorite = () => {
    Alert.alert(
      "Remove from Favorites",
      "Are you sure you want to remove this location from favorites?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFavoriteMutation.mutate({ locationId }),
        },
      ],
    );
  };

  const handleSetPrimary = () => {
    setPrimaryMutation.mutate({ locationId });
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header Section */}
        <View className="mb-6">
          <View className="mb-4 flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="mb-2 text-2xl font-bold text-gray-900">
                {location.name}
              </Text>
              <View className="flex-row items-center">
                <MapPin size={16} color="#6b7280" />
                <Text className="ml-1 flex-1 text-gray-600">
                  {location.address}
                </Text>
              </View>
            </View>

            {location.isFavorited && location.isPrimary && (
              <Badge variant="secondary">Primary</Badge>
            )}
          </View>

          {/* Stats Cards */}
          <View className="mb-6 flex-row gap-4">
            <View className="flex-1">
              <Card>
                <CardContent>
                  <View className="flex-row items-center">
                    <Package size={20} color="#3b82f6" />
                    <View className="ml-3">
                      <Text className="text-sm font-medium text-gray-600">
                        Storage Capacity
                      </Text>
                      <Text className="text-2xl font-bold text-gray-900">
                        {location.storageCapacity}
                      </Text>
                      <Text className="text-xs text-gray-500">packages</Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            </View>

            <View className="flex-1">
              <Card>
                <CardContent>
                  <View className="flex-row items-center">
                    <MapPin size={20} color="#3b82f6" />
                    <View className="ml-3">
                      <Text className="text-sm font-medium text-gray-600">
                        Location Type
                      </Text>
                      <Text className="text-lg font-semibold capitalize text-gray-900">
                        {location.locationType.toLowerCase()}
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mb-6 flex-row gap-3">
            {!location.isFavorited ? (
              <Button
                onPress={handleAddFavorite}
                loading={addFavoriteMutation.isPending}
                className="flex-1"
              >
                <Heart size={16} weight="regular" />
                Add to Favorites
              </Button>
            ) : (
              <>
                {!location.isPrimary && (
                  <Button
                    variant="outline"
                    onPress={handleSetPrimary}
                    loading={setPrimaryMutation.isPending}
                    className="flex-1"
                  >
                    Set as Primary
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onPress={handleRemoveFavorite}
                  loading={removeFavoriteMutation.isPending}
                  className="flex-1"
                >
                  <Heart size={16} weight="fill" />
                  <Text className="text-black">Remove from Favorites</Text>
                </Button>
              </>
            )}
          </View>
        </View>

        {/* Location Info Section */}
        <View className="mb-6">
          <LocationInfo
            address={location.address}
            name={location.name}
            className="h-48"
          />
        </View>

        {/* Recent Orders */}
        {location.orders && location.orders.length > 0 && (
          <View>
            <Text className="mb-4 text-xl font-semibold text-gray-900">
              Your Recent Orders
            </Text>
            <View className="space-y-3">
              {location.orders.map((order) => (
                <Card key={order.id}>
                  <CardContent>
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900">
                          Order #{order.vendorOrderId}
                        </Text>
                        <View className="mt-2 flex-row items-center gap-4">
                          <View className="flex-row items-center">
                            <CurrencyDollar size={12} color="#6b7280" />
                            <Text className="ml-1 text-sm text-gray-600">
                              ${order.total.toFixed(2)}
                            </Text>
                          </View>
                          {order.deliveredDate && (
                            <View className="flex-row items-center">
                              <Clock size={12} color="#6b7280" />
                              <Text className="ml-1 text-sm text-gray-600">
                                Delivered{" "}
                                {format(new Date(order.deliveredDate), "PP")}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Badge
                        variant={order.pickedUpAt ? "secondary" : "outline"}
                      >
                        {order.pickedUpAt ? "Picked Up" : "Ready for Pickup"}
                      </Badge>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

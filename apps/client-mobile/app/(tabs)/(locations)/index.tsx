import React, { useCallback, useState } from "react";
import { Alert, FlatList, RefreshControl, Text, View } from "react-native";
import Toast from "react-native-root-toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LocationCard } from "@/components/locations/LocationCard";
import { LocationSearch } from "@/components/locations/LocationSearch";
import { api } from "@/trpc/react";

export default function LocationsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [addingFavoriteId, setAddingFavoriteId] = useState<number | null>(null);

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

  // API Queries
  const {
    data: favorites,
    isLoading: favoritesLoading,
    refetch: refetchFavorites,
  } = api.favorites.getFavorites.useQuery();

  const { data: searchResults } = api.favorites.searchLocations.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 2 },
  );

  // API Mutations
  const addFavoriteMutation = api.favorites.addFavorite.useMutation({
    onMutate: (variables) => {
      setAddingFavoriteId(variables.locationId);
    },
    onSuccess: () => {
      refetchFavorites();
      showToast("Location added to favorites!");
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
    onSettled: () => {
      setAddingFavoriteId(null);
    },
  });

  const removeFavoriteMutation = api.favorites.removeFavorite.useMutation({
    onSuccess: () => {
      refetchFavorites();
      showToast("Location removed from favorites");
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });

  const handleAddFavorite = useCallback(
    (locationId: number) => {
      addFavoriteMutation.mutate({ locationId });
    },
    [addFavoriteMutation],
  );

  // Handle deep link for adding to favorites
  React.useEffect(() => {
    if (params.addToFavorite) {
      const locationId = parseInt(params.addToFavorite as string);
      if (!isNaN(locationId)) {
        handleAddFavorite(locationId);
      }
    }
  }, [handleAddFavorite, params.addToFavorite]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleToggleFavorite = (locationId: number) => {
    const favorite = favorites?.find((f) => f.location.id === locationId);
    if (favorite) {
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
    } else {
      handleAddFavorite(locationId);
    }
  };

  const handleResultPress = (locationId: number) => {
    router.push(`/(tabs)/(locations)/${locationId}` as any);
  };

  const renderFavoriteLocation = ({ item }: { item: any }) => (
    <View className="mb-3">
      <LocationCard
        location={{
          id: item.location.id,
          name: item.location.name,
          address: item.location.address,
          storageCapacity: item.location.storageCapacity,
          locationType: item.location.locationType,
          isFavorited: true,
          isPrimary: item.isPrimary,
        }}
        onToggleFavorite={handleToggleFavorite}
        isToggling={removeFavoriteMutation.isPending}
        showFavoriteButton={false}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="border-b border-gray-200 bg-white p-4">
        <LocationSearch
          searchResults={searchResults || []}
          onSearch={handleSearch}
          onAddFavorite={handleAddFavorite}
          onResultPress={handleResultPress}
          isAddingFavorite={!!addingFavoriteId}
        />
      </View>

      <View className="flex-1 p-4">
        <Text className="mb-4 text-xl font-semibold text-gray-900">
          Favorite Locations
        </Text>

        {favorites?.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-gray-500">
              No favorite locations yet.{"\n"}Search and add some above!
            </Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderFavoriteLocation}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={favoritesLoading}
                onRefresh={refetchFavorites}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

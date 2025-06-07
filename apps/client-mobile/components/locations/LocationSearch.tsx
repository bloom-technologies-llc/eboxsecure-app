import React, { useEffect, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { MapPin } from "phosphor-react-native";

import { SearchInput } from "../ui/SearchInput";
import { FavoriteButton } from "./FavoriteButton";

interface SearchResult {
  id: number;
  name: string;
  address: string;
  isFavorited: boolean;
}

interface LocationSearchProps {
  searchResults: SearchResult[];
  onSearch: (query: string) => void;
  onAddFavorite: (locationId: number) => void;
  onResultPress: (locationId: number) => void;
  isAddingFavorite: boolean;
}

export function LocationSearch({
  searchResults,
  onSearch,
  onAddFavorite,
  onResultPress,
  isAddingFavorite,
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      onSearch(searchQuery);
    }
  }, [searchQuery, onSearch]);

  const handleFocus = () => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsFocused(true);
  };

  const handleResultPress = (locationId: number) => {
    // Immediately close dropdown when navigating
    setIsFocused(false);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    onResultPress(locationId);
  };

  const handleFavoritePress = (locationId: number) => {
    console.log("handleFavoritePress", locationId);
    onAddFavorite(locationId);
    // Don't close dropdown immediately - let user continue browsing
  };

  const handleTestPress = (locationId: number) => {
    console.log("TEST BUTTON PRESSED", locationId);
    onAddFavorite(locationId);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Show results when focused AND we have a search query AND we have results
  const showResults =
    isFocused && searchQuery.length >= 2 && searchResults.length > 0;

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
      {/* Clickable text area */}
      <TouchableOpacity
        onPress={() => handleResultPress(item.id)}
        className="mr-3 flex-1"
        activeOpacity={0.7}
      >
        <Text className="font-medium text-gray-900" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="mt-1 flex-row items-center">
          <MapPin size={12} color="#6b7280" />
          <Text className="ml-1 text-sm text-gray-600" numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row gap-2">
        <FavoriteButton
          isFavorited={item.isFavorited}
          isLoading={isAddingFavorite}
          onToggle={() => handleFavoritePress(item.id)}
          variant="small"
        />
      </View>
    </View>
  );

  return (
    <View className="relative">
      <SearchInput
        placeholder="Search for locations..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFocus={handleFocus}
      />

      {showResults && (
        <View className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 rounded-lg border border-gray-200 bg-white shadow-lg">
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id.toString()}
            style={{ maxHeight: 240 }}
          />
        </View>
      )}
    </View>
  );
}

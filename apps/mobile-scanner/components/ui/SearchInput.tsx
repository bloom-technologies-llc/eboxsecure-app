import React from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { MagnifyingGlass } from "phosphor-react-native";

interface SearchInputProps extends TextInputProps {
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchInput({ onFocus, onBlur, ...props }: SearchInputProps) {
  return (
    <View className="relative">
      <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
        <MagnifyingGlass size={16} color="#6b7280" />
      </View>
      <TextInput
        className="rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900"
        placeholderTextColor="#6b7280"
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      />
    </View>
  );
}

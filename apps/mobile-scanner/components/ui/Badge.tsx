import React from "react";
import { Text, View } from "react-native";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-gray-100 border-gray-200";
      case "outline":
        return "bg-transparent border-gray-300";
      default:
        return "bg-blue-100 border-blue-200";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "secondary":
        return "text-gray-700";
      case "outline":
        return "text-gray-600";
      default:
        return "text-blue-700";
    }
  };

  return (
    <View className={`${getVariantStyles()} rounded-full border px-2 py-1`}>
      <Text className={`${getTextColor()} text-xs font-medium`}>
        {children}
      </Text>
    </View>
  );
}

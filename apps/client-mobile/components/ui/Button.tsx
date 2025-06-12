import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "destructive" | "secondary";
  size?: "sm" | "default" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "outline":
        return "bg-transparent border border-gray-300";
      case "destructive":
        return "bg-red-500";
      case "secondary":
        return "bg-gray-100";
      default:
        return "bg-blue-500";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5";
      case "lg":
        return "px-6 py-4";
      default:
        return "px-4 py-2";
    }
  };

  const getTextColor = () => {
    return variant === "outline" || variant === "secondary"
      ? "text-gray-700"
      : "text-white";
  };

  return (
    <TouchableOpacity
      className={`${getVariantStyles()} ${getSizeStyles()} flex-row items-center justify-center rounded-lg ${disabled || loading ? "opacity-50" : ""}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === "outline" ? "#374151" : "#ffffff"}
          className="mr-2"
        />
      )}
      <Text className={`${getTextColor()} text-center font-medium`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

import React from "react";
import { Heart } from "phosphor-react-native";

import { Button } from "../ui/Button";

interface FavoriteButtonProps {
  isFavorited: boolean;
  isLoading: boolean;
  onToggle: () => void;
  variant?: "default" | "small";
  disabled?: boolean;
}

export function FavoriteButton({
  isFavorited,
  isLoading,
  onToggle,
  variant = "default",
  disabled = false,
}: FavoriteButtonProps) {
  const size = variant === "small" ? "sm" : "default";

  return (
    <Button
      size={size}
      variant={isFavorited ? "secondary" : "outline"}
      disabled={disabled || isFavorited}
      onPress={onToggle}
      loading={isLoading}
    >
      <Heart
        size={variant === "small" ? 12 : 16}
        weight={isFavorited ? "fill" : "regular"}
      />
      {variant !== "small" && (isFavorited ? "Favorited" : "Add")}
    </Button>
  );
}

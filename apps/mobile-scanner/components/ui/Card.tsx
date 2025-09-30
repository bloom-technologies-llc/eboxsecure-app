import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "primary";
}

export function Card({
  children,
  variant = "default",
  style,
  ...props
}: CardProps) {
  const borderColor =
    variant === "primary" ? "border-blue-500" : "border-gray-200";

  return (
    <View
      className={`rounded-lg border bg-white ${borderColor} p-4 shadow-sm`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardContent({
  children,
  ...props
}: { children: React.ReactNode } & ViewProps) {
  return <View {...props}>{children}</View>;
}

export function CardHeader({
  children,
  ...props
}: { children: React.ReactNode } & ViewProps) {
  return (
    <View className="mb-2" {...props}>
      {children}
    </View>
  );
}

export function CardTitle({
  children,
  ...props
}: { children: React.ReactNode } & ViewProps) {
  return <View {...props}>{children}</View>;
}

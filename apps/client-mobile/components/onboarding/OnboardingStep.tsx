import type { ReactNode } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "@/assets/images/logos/eboxsecure-logo.png";
import { ArrowRight } from "phosphor-react-native";

import { useOnboarding } from "./OnboardingContext";

interface OnboardingStepProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  onNext?: () => void;
  nextButtonText?: string;
  disableNext?: boolean;
  loading?: boolean;
  stepIndicator?: ReactNode;
}

export function OnboardingStep({
  title,
  subtitle,
  children,
  onNext,
  nextButtonText = "Continue",
  disableNext = false,
  loading = false,
  stepIndicator,
}: OnboardingStepProps) {
  const { goToNext } = useOnboarding();

  const handleNext = () => onNext?.() || goToNext();

  const isButtonDisabled = disableNext || loading;
  const buttonBgClass = isButtonDisabled ? "bg-gray-300" : "bg-blue-600";
  const buttonTextClass = isButtonDisabled ? "text-gray-500" : "text-white";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pb-8 pt-4">
          <View className="mb-8 items-center">
            <Image
              source={logo}
              style={{ width: 80, height: 56, marginBottom: 16 }}
              resizeMode="contain"
            />
            <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
              {title}
            </Text>
            <Text className="text-center leading-5 text-gray-600">
              {subtitle}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-6">{children}</View>

        {/* Step Indicator */}
        {stepIndicator && <View className="px-6 pb-4">{stepIndicator}</View>}

        {/* Bottom Section */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleNext}
            disabled={isButtonDisabled}
            className={`flex-row items-center justify-center space-x-2 rounded-xl px-6 py-4 ${buttonBgClass}`}
            activeOpacity={0.8}
          >
            <Text className={`text-lg font-semibold ${buttonTextClass}`}>
              {loading ? "Loading..." : nextButtonText}
            </Text>
            {!loading && (
              <ArrowRight
                size={20}
                color={isButtonDisabled ? "#9ca3af" : "#ffffff"}
                weight="bold"
              />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { Text, View } from "react-native";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  return (
    <View className="px-6 py-4">
      {/* Step Indicator */}
      <View className="flex-row items-center justify-center gap-x-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <View
              key={index}
              className={`h-3 w-3 rounded-full border-2 ${
                isCompleted
                  ? "border-blue-600 bg-blue-600"
                  : isCurrent
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300 bg-white"
              }`}
            />
          );
        })}
      </View>

      {/* Step Counter */}
      <View className="mt-2 flex-row items-center justify-center"></View>
    </View>
  );
}

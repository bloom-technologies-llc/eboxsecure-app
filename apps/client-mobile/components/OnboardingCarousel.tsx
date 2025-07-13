import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";
import { Dimensions, FlatList, View } from "react-native";

import { OnboardingStep } from "./onboarding/OnboardingStep";

const { width: screenWidth } = Dimensions.get("window");

interface OnboardingCarouselProps {
  steps: {
    id: string;
    title: string;
    subtitle: string;
    component: ReactNode;
    nextButtonText?: string;
    disableNext?: boolean;
    loading?: boolean;
  }[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext?: (step: number) => void;
  stepIndicator?: ReactNode;
}

export function OnboardingCarousel({
  steps,
  currentStep,
  onStepChange,
  onNext,
  stepIndicator,
}: OnboardingCarouselProps) {
  const handleScroll = useCallback(
    (event: any) => {
      const { contentOffset } = event.nativeEvent;
      const step = Math.round(contentOffset.x / screenWidth);
      if (step !== currentStep) {
        onStepChange(step);
      }
    },
    [currentStep, onStepChange],
  );

  const handleNext = useCallback(
    (step: number) => {
      onNext?.(step);
    },
    [onNext],
  );

  const renderStep = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <View style={{ width: screenWidth }}>
        <OnboardingStep
          title={item.title}
          subtitle={item.subtitle}
          nextButtonText={item.nextButtonText}
          disableNext={item.disableNext}
          loading={item.loading}
          onNext={() => handleNext(index)}
          stepIndicator={stepIndicator}
        >
          {item.component}
        </OnboardingStep>
      </View>
    ),
    [handleNext, stepIndicator],
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  const flatListData = useMemo(() => steps, [steps]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={flatListData}
        renderItem={renderStep}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />
    </View>
  );
}

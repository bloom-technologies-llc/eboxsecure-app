import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  OnboardingProvider,
  useOnboarding,
} from "@/components/onboarding/OnboardingContext";
import { OnboardingCarousel } from "@/components/OnboardingCarousel";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { useOnboardingStatus } from "@/hooks/useOnboarding";

// Placeholder step components
const AccountStep = () => (
  <View className="flex-1 items-center justify-center">
    <Text className="text-lg text-gray-700">Account Creation Step</Text>
    <Text className="mt-2 text-center text-gray-500">
      Clerk mobile API integration will go here
    </Text>
  </View>
);

const PhotoStep = () => (
  <View className="flex-1 items-center justify-center">
    <Text className="text-lg text-gray-700">Photo Capture Step</Text>
    <Text className="mt-2 text-center text-gray-500">
      Camera and gallery integration will go here
    </Text>
  </View>
);

const PaymentStep = () => (
  <View className="flex-1 items-center justify-center">
    <Text className="text-lg text-gray-700">Payment Setup Step</Text>
    <Text className="mt-2 text-center text-gray-500">
      Stripe Payment Sheet integration will go here
    </Text>
  </View>
);

function OnboardingContent() {
  const { currentStep, goToNext, goToStep, totalSteps, markCompleted } =
    useOnboarding();
  const { markOnboardingComplete } = useOnboardingStatus();
  const router = useRouter();

  const steps = useMemo(
    () => [
      {
        id: "account",
        title: "Create Your Account",
        subtitle: "Set up your secure EboxSecure account to get started",
        component: <AccountStep />,
      },
      {
        id: "photo",
        title: "Add Your Photo",
        subtitle: "Take a photo or choose from your gallery for your profile",
        component: <PhotoStep />,
      },
      {
        id: "payment",
        title: "Set Up Payment",
        subtitle: "Securely add your payment method to complete setup",
        component: <PaymentStep />,
        nextButtonText: "Complete Setup",
      },
    ],
    [],
  );

  const handleStepChange = useCallback(
    (step: number) => {
      goToStep(step);
    },
    [goToStep],
  );

  const handleNext = useCallback(
    async (step: number) => {
      if (step === steps.length - 1) {
        markCompleted();
        await markOnboardingComplete();
        // Navigate to the main app after onboarding completion
        router.replace("/(tabs)/(orders)");
      } else {
        goToNext();
      }
    },
    [steps.length, markCompleted, markOnboardingComplete, goToNext, router],
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <OnboardingCarousel
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onNext={handleNext}
        stepIndicator={
          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        }
      />
    </SafeAreaView>
  );
}

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const totalSteps = 3;

  const goToNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, totalSteps]);

  const goToPrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps],
  );

  const markCompleted = useCallback(() => {
    setIsCompleted(true);
  }, []);

  const contextValue = {
    currentStep,
    goToNext,
    goToPrevious,
    goToStep,
    totalSteps,
    isCompleted,
    markCompleted,
  };

  return (
    <OnboardingProvider value={contextValue}>
      <OnboardingContent />
    </OnboardingProvider>
  );
}

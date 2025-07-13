import { createContext, ReactNode, useContext } from "react";

interface OnboardingContextType {
  goToNext: () => void;
  goToPrevious: () => void;
  goToStep: (step: number) => void;
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  markCompleted: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: OnboardingContextType;
}) {
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

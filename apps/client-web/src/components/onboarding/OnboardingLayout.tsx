import { ReactNode } from "react";
import { CheckCircle } from "lucide-react";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  description?: string;
}

export default function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  title,
  description,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Progress Bar */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-600">
                Step {currentStep} of {totalSteps}
              </div>
              <div className="h-2 w-48 flex-1 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Setting up your EboxSecure account
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-600">
              {description}
            </p>
          )}
        </div>

        <div className="mx-auto max-w-2xl">{children}</div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t bg-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Your data is protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

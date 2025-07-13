import { redirect } from "next/navigation";
import { checkValidSubscription } from "@/lib/subscription-utils";

export default async function SuccessPage() {
  // Check if user has an active subscription after successful payment
  const hasValidSubscription = await checkValidSubscription();

  if (hasValidSubscription) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Payment Successful!
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Processing your subscription... You'll be redirected to onboarding
          shortly.
        </p>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";

import { hasValidSubscription } from "@ebox/client-api";

export default async function SuccessPage() {
  // Check if user has an active subscription after successful payment
  const userHasValidSubscription = await hasValidSubscription();

  if (userHasValidSubscription) {
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

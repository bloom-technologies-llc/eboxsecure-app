import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { getStripeCustomerId, hasValidSubscription } from "@ebox/stripe";

export default async function SuccessPage() {
  const user = await currentUser();

  if (!user) {
    console.error("Request does not have user");
    return false;
  }

  const stripeCustomerId = await getStripeCustomerId(user.id);

  if (!stripeCustomerId) {
    return false;
  }

  const userHasValidSubscription = await hasValidSubscription(stripeCustomerId);

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

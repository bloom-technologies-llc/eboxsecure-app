import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { CreditCard } from "lucide-react";

// import { handleSubscriptionFormAction } from "@/actions/handle-subscription-form-action";
import { getStripeCustomerId, hasValidSubscription } from "@ebox/stripe";

import PricingCards from "./pricing-cards";

export default async function PaymentPage() {
  const user = await currentUser();

  if (!user) {
    console.error("Request does not have user");
    return false;
  }

  const stripeCustomerId = await getStripeCustomerId(user.id);

  if (stripeCustomerId) {
    const userHasValidSubscription =
      await hasValidSubscription(stripeCustomerId);

    if (userHasValidSubscription) {
      redirect("/onboarding");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="mt-2 text-lg text-gray-600">
            Select a subscription plan to get started with EboxSecure
          </p>
        </div>

        {/* Plans Grid */}
        <PricingCards />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            All plans include secure package delivery and 24/7 customer support.
          </p>
          <p className="mt-2">
            You can change or cancel your subscription at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

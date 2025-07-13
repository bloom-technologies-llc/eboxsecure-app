import { redirect } from "next/navigation";
import { handleSubscriptionFormAction } from "@/actions/handle-subscription-form-action";
import { checkValidSubscription } from "@/lib/subscription-utils";
import { plans } from "@/utils/plans-data";
import { CreditCard } from "lucide-react";

import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

export default async function PaymentPage() {
  // Check if user already has an active subscription
  const hasValidSubscription = await checkValidSubscription();

  if (hasValidSubscription) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.lookupKey}
              className={`relative flex flex-col ${
                plan.mostPopular
                  ? "border-blue-500 ring-2 ring-blue-500"
                  : "border-gray-200"
              }`}
            >
              {plan.mostPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-sm font-medium text-white">
                  Most Popular
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-blue-500">✓</span>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <form action={handleSubscriptionFormAction}>
                  <input
                    type="hidden"
                    name="lookupKey"
                    value={plan.lookupKey}
                  />
                  <Button
                    type="submit"
                    className={`w-full ${
                      plan.mostPopular
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    Get Started
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>

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

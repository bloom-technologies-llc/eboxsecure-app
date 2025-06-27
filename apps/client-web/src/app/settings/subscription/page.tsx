"use client";

import { redirect } from "next/navigation";
import SettingsLayout from "@/components/settings-layout";
// Add a server action for handling the upgrade
import { createStripeSession } from "@/lib/create-stripe-session";
import { Check, Crown, Zap } from "lucide-react";

import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

// Add enum for lookup keys
enum PlanLookupKey {
  Basic = "basic",
  BasicPlus = "basic_pro",
  Premium = "premium",
  BusinessPro = "business_pro",
}

const plans = [
  {
    name: "Basic",
    price: "$9.99",
    period: "/month",
    description: "Perfect for individuals with occasional package deliveries.",
    current: false,
    lookupKey: PlanLookupKey.Basic,
    features: [
      "Access to 3 EboxSecure locations",
      "2-day package holding",
      "Maximum 5 packages",
      "Standard support",
    ],
  },
  {
    name: "Basic+",
    price: "$19.99",
    period: "/month",
    description: "Great for regular online shoppers with more delivery needs.",
    current: false,
    lookupKey: PlanLookupKey.BasicPlus,
    features: [
      "Access to 25 EboxSecure locations",
      "5-day package holding",
      "Maximum 20 packages",
      "Standard support",
    ],
  },
  {
    name: "Premium",
    price: "$49.99",
    period: "/month",
    description: "Ideal for small businesses with regular deliveries.",
    current: true,
    mostPopular: true,
    lookupKey: PlanLookupKey.Premium,
    features: [
      "Access to 75 EboxSecure locations",
      "7-day package holding",
      "Maximum 50 packages",
      "Priority support",
      "Returns handling",
      "Discounted last-mile delivery service",
    ],
  },
  {
    name: "Business Pro",
    price: "$99.99",
    period: "/month",
    description: "For businesses with high-volume delivery needs.",
    current: false,
    lookupKey: PlanLookupKey.BusinessPro,
    features: [
      "Unlimited EboxSecure locations",
      "10-day package holding",
      "Maximum 200 packages",
      "Priority support",
      "Returns handling",
      "Discounted last-mile delivery service",
      "Dedicated account management",
    ],
  },
];

async function handleUpgradeAction(formData: FormData) {
  const lookupKey = formData.get("lookupKey") as PlanLookupKey;
  if (!lookupKey) return;
  const url = await createStripeSession(lookupKey);
  if (url) redirect(url);
}

export default function SubscriptionPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Subscription Plans
            </CardTitle>
            <CardDescription>
              Choose the plan that best fits your package delivery needs
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Current Plan Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-500" />
                <div>
                  <h3 className="text-lg font-semibold">Premium Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Next billing date: December 24, 2024
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">$49.99</p>
                <p className="text-sm text-muted-foreground">/month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.current ? "border-primary" : ""}`}
            >
              {plan.mostPopular && (
                <Badge className="absolute -top-2 right-2 bg-blue-100 text-blue-800">
                  Most popular
                </Badge>
              )}
              {plan.current && !plan.mostPopular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 transform">
                  Current Plan
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.name === "Diamond" && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                  {plan.name === "Gold" && (
                    <Zap className="h-5 w-5 text-yellow-500" />
                  )}
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <form action={handleUpgradeAction}>
                  <input
                    type="hidden"
                    name="lookupKey"
                    value={plan.lookupKey}
                  />
                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : "primary"}
                    disabled={plan.current}
                    type="submit"
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>
              Manage your subscription billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-renewal</p>
                <p className="text-sm text-muted-foreground">
                  Your subscription will automatically renew on December 24,
                  2024
                </p>
              </div>
              <Button variant="outline">Manage Billing</Button>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-sm font-medium">Cancel Subscription</p>
                <p className="text-sm text-muted-foreground">
                  You can cancel anytime. Your plan will remain active until the
                  next billing cycle.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Cancel Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}

"use client";

import SettingsLayout from "@/components/settings-layout";
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

const plans = [
  {
    name: "Bronze",
    price: "$9.99",
    period: "/month",
    description: "Perfect for individuals",
    current: false,
    features: [
      "Up to 5 packages per month",
      "Basic tracking",
      "Email notifications",
      "Standard support",
    ],
  },
  {
    name: "Silver",
    price: "$19.99",
    period: "/month",
    description: "Great for regular users",
    current: false,
    features: [
      "Up to 15 packages per month",
      "Advanced tracking",
      "SMS & Email notifications",
      "Priority support",
      "Package insurance",
    ],
  },
  {
    name: "Gold",
    price: "$39.99",
    period: "/month",
    description: "Ideal for families",
    current: true,
    features: [
      "Up to 30 packages per month",
      "Real-time tracking",
      "All notification types",
      "24/7 priority support",
      "Full package insurance",
      "Multiple trusted contacts",
    ],
  },
  {
    name: "Diamond",
    price: "$79.99",
    period: "/month",
    description: "For power users",
    current: false,
    features: [
      "Unlimited packages",
      "Premium tracking features",
      "All notification types",
      "Dedicated support line",
      "Premium package insurance",
      "Advanced security features",
      "API access",
    ],
  },
];

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
                  <h3 className="text-lg font-semibold">Gold Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Next billing date: December 24, 2024
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">$39.99</p>
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
              {plan.current && (
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
                <Button
                  className="w-full"
                  variant={plan.current ? "outline" : "primary"}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
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

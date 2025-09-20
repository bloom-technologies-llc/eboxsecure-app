"use client";

import { useState } from "react";
import { plans } from "@/utils/plans-data";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

import SubscribeButton from "./subscribe-button";

export default function PricingCards() {
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("year");
  return (
    <div className="space-y-8">
      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <span
            className={`text-sm font-medium ${billingPeriod === "month" ? "text-gray-900" : "text-gray-500"}`}
          >
            Monthly
          </span>
          <button
            type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              billingPeriod === "year" ? "bg-blue-600" : "bg-gray-200"
            }`}
            onClick={() =>
              setBillingPeriod(billingPeriod === "month" ? "year" : "month")
            }
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingPeriod === "year" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="flex items-center gap-1">
            <span
              className={`text-sm font-medium ${billingPeriod === "year" ? "text-gray-900" : "text-gray-500"}`}
            >
              Yearly
            </span>

            <span className="py-1 text-xs font-medium italic text-green-800">
              (Save 20%)
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
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
                  {billingPeriod === "month"
                    ? plan.prices.month.price
                    : plan.prices.year.price}
                </span>
                <span className="text-gray-600">
                  /{billingPeriod === "month" ? "month" : "year"}
                </span>
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

              <SubscribeButton
                lookupKey={plan.lookupKey}
                mostPopular={plan.mostPopular ?? false}
                billingPeriod={billingPeriod}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

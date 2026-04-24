"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { plans } from "@/utils/plans-data";
import { AlertTriangle, Check, Loader2 } from "lucide-react";

import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

import { CancelDowngradeDialog } from "./cancel-downgrade-dialog";
import { ChangeBillingPeriodDialog } from "./change-billing-period-dialog";
import { DowngradeConfirmationDialog } from "./downgrade-confirmation-dialog";
import {
  getPlanAction,
  getPlanActionText,
  getPlanActionVariant,
} from "./subscription-plan-utils";
import { UpgradeConfirmationDialog } from "./upgrade-confirmation-dialog";

export default function PricingPlans() {
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("year");
  const { data, isLoading, isError } =
    api.subscription.getCurrentPlan.useQuery();

  const {
    subscriptionData: subscriptionStatus,
    plan: currentPlan,
    price: currentPrice,
    scheduledPlan,
    billingPeriod: currentBillingPeriod,
  } = data || {};

  useEffect(() => {
    if (currentPlan?.isYearly) {
      setBillingPeriod("year");
    } else {
      setBillingPeriod("month");
    }
  }, [currentPlan?.isYearly]);

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin text-gray-400" />;
  }

  if (
    !data ||
    isError ||
    !currentPlan ||
    !currentBillingPeriod ||
    !subscriptionStatus
  ) {
    return (
      <div className="flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">
          Failed to load subscription data
        </span>
      </div>
    );
  }

  const currentPlanLookupKey = currentPlan.subscriptionType.toLowerCase();
  const hasScheduledDowngrade = scheduledPlan?.changeType === "downgrade";
  const scheduledPlanLookupKey =
    scheduledPlan?.plan?.subscriptionType.toLowerCase();

  return (
    <>
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
              (Save 15%)
            </span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrentPlan =
            currentPlanLookupKey.toLowerCase() === plan.lookupKey.toLowerCase();
          const isCrossBillingPeriod = currentBillingPeriod !== billingPeriod;
          const isScheduledPlan = scheduledPlanLookupKey === plan.lookupKey;
          const planAction = getPlanAction(
            currentPlan.subscriptionType,
            plan.lookupKey,
            scheduledPlan?.plan?.subscriptionType ?? undefined,
          );
          const actionText = getPlanActionText(planAction);
          const actionVariant = getPlanActionVariant(planAction);

          const isAllowed =
            !isCrossBillingPeriod || (isCrossBillingPeriod && isCurrentPlan);

          const showDowngradeDialog =
            planAction === "downgrade" || planAction === "change downgrade";

          const showUpgradeDialog =
            planAction === "upgrade" ||
            planAction === "cancel downgrade and upgrade";

          const showCancelDowngradeDialog =
            scheduledPlan && planAction === "cancel downgrade";

          const scheduledBillingPeriod = scheduledPlan?.plan.isYearly
            ? "year"
            : "month";
          const alreadyScheduledChangeBillingPeriod =
            scheduledPlan?.plan.subscriptionType === plan.lookupKey &&
            scheduledBillingPeriod === billingPeriod;

          const showChangeBillingPeriodDialog =
            isCrossBillingPeriod &&
            isCurrentPlan &&
            !alreadyScheduledChangeBillingPeriod;

          const showSubscribeButton =
            isCurrentPlan && !showChangeBillingPeriodDialog;
          return (
            <Card
              key={plan.name}
              className={`relative ${isCurrentPlan ? "border-primary" : ""} ${isScheduledPlan ? "border-orange-400" : ""}`}
            >
              {plan.mostPopular && !isCurrentPlan && !isScheduledPlan && (
                <Badge className="absolute -top-2 right-2 bg-blue-100 text-blue-800">
                  Most popular
                </Badge>
              )}
              {isCurrentPlan && !plan.mostPopular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 transform">
                  Current Plan
                </Badge>
              )}
              {isScheduledPlan && hasScheduledDowngrade && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 transform bg-orange-100 text-orange-800">
                  Scheduled{" "}
                  {scheduledPlan?.startDate
                    ? `from ${new Date(scheduledPlan.startDate * 1000).toLocaleDateString()}`
                    : ""}
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-2">
                  <span className="text-3xl font-bold">
                    {plan.prices[billingPeriod].price}
                  </span>
                  <span className="text-muted-foreground">
                    {billingPeriod === "month" ? "/month" : "/year"}
                  </span>
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

                {!isAllowed && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    You can only migrate to plans within the same billing
                    period, or switch to the same plan at a different billing
                    period.
                  </p>
                )}
                {isAllowed && (
                  <>
                    {showDowngradeDialog && (
                      <DowngradeConfirmationDialog
                        targetPlan={{
                          name: plan.name,
                          price: plan.prices[billingPeriod].price,
                          lookupKey: plan.lookupKey,
                          billingPeriod: billingPeriod,
                        }}
                        currentPlan={{
                          name: currentPlan.subscriptionType,
                          price: `$${currentPrice?.toString()}` || "",
                          billingPeriod: currentBillingPeriod,
                        }}
                        currentPeriodEnd={
                          subscriptionStatus?.currentPeriodEnd || 0
                        }
                      >
                        <Button className="w-full" variant={actionVariant}>
                          {actionText}
                        </Button>
                      </DowngradeConfirmationDialog>
                    )}
                    {showUpgradeDialog && (
                      <UpgradeConfirmationDialog
                        targetPlan={{
                          name: plan.name,
                          price: plan.prices[billingPeriod].price,
                          lookupKey: plan.lookupKey,
                          billingPeriod: billingPeriod,
                        }}
                        currentPlan={{
                          name: currentPlan.subscriptionType,
                          price: `$${currentPrice?.toString()}` || "",
                          billingPeriod: currentBillingPeriod,
                        }}
                      >
                        <Button
                          className="h-full w-full text-wrap"
                          variant={actionVariant}
                        >
                          {actionText}
                        </Button>
                      </UpgradeConfirmationDialog>
                    )}
                    {showCancelDowngradeDialog && (
                      <CancelDowngradeDialog
                        currentPlan={{
                          name: currentPlan.subscriptionType,
                          price: `$${currentPrice?.toString()}` || "",
                        }}
                        downgradedPlan={{
                          plan: scheduledPlan.plan?.subscriptionType!,
                          price: scheduledPlan.price,
                        }}
                      >
                        <Button className="w-full" variant={actionVariant}>
                          {actionText}
                        </Button>
                      </CancelDowngradeDialog>
                    )}
                    {showChangeBillingPeriodDialog && (
                      <ChangeBillingPeriodDialog
                        currentBillingPeriod={currentBillingPeriod}
                        currentBillingPeriodEnd={
                          subscriptionStatus?.currentPeriodEnd
                        }
                      />
                    )}
                    {alreadyScheduledChangeBillingPeriod && (
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        You have already scheduled a billing period change.
                      </p>
                    )}
                    {showSubscribeButton && (
                      <Button
                        className="w-full"
                        variant={actionVariant}
                        disabled
                      >
                        {actionText}
                      </Button>
                    )}
                    {(planAction === "upgrade" ||
                      planAction === "cancel downgrade and upgrade") &&
                      !hasScheduledDowngrade && (
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                          You'll be charged a prorated amount for the remaining
                          billing period
                        </p>
                      )}
                    {(planAction === "downgrade" ||
                      planAction === "change downgrade") &&
                      !hasScheduledDowngrade && (
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                          Downgrade will take effect on your next billing cycle
                        </p>
                      )}
                    {hasScheduledDowngrade && isScheduledPlan && (
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        This plan will take effect on{" "}
                        {new Date(
                          scheduledPlan?.startDate! * 1000,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

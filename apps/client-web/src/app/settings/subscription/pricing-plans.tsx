import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { plans } from "@/utils/plans-data";
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

import { DowngradeConfirmationDialog } from "./downgrade-confirmation-dialog";
import SubscribeButton from "./subscribe-button";
import {
  getPlanAction,
  getPlanActionText,
  getPlanActionVariant,
} from "./subscription-plan-utils";
import { UpgradeConfirmationDialog } from "./upgrade-confirmation-dialog";

export default async function PricingPlans() {
  const {
    subscriptionData: subscriptionStatus,
    plan: currentPlan,
    price,
    scheduledPlan,
  } = await api.subscription.getCurrentPlan();
  if (!currentPlan) {
    redirect("/payment");
  }
  const currentPlanLookupKey = currentPlan.toLowerCase();
  const hasScheduledDowngrade = scheduledPlan?.changeType === "downgrade";
  const scheduledPlanLookupKey = scheduledPlan?.plan?.toLowerCase();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => {
        const isCurrentPlan = currentPlanLookupKey === plan.lookupKey;
        const isScheduledPlan = scheduledPlanLookupKey === plan.lookupKey;
        const planAction = getPlanAction(currentPlan, plan.lookupKey);
        const actionText = getPlanActionText(planAction);
        const actionVariant = getPlanActionVariant(planAction);

        // Override action text and variant if there's a scheduled downgrade
        let finalActionText = actionText;
        let finalActionVariant = actionVariant;
        let isActionDisabled = isCurrentPlan;

        if (hasScheduledDowngrade) {
          if (isScheduledPlan) {
            finalActionText = "Scheduled";
            finalActionVariant = "outline";
            isActionDisabled = true;
          } else if (planAction === "downgrade") {
            finalActionText = "Downgrade Scheduled";
            finalActionVariant = "outline";
            isActionDisabled = true;
          }
        }

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
              {planAction === "downgrade" && !hasScheduledDowngrade ? (
                <DowngradeConfirmationDialog
                  targetPlan={{
                    name: plan.name,
                    price: plan.price,
                    lookupKey: plan.lookupKey,
                  }}
                  currentPlan={{
                    name: currentPlan,
                    price: price.toString(),
                  }}
                  currentPeriodEnd={subscriptionStatus?.currentPeriodEnd || 0}
                >
                  <Button
                    className="w-full"
                    variant={finalActionVariant}
                    disabled={isActionDisabled}
                  >
                    {finalActionText}
                  </Button>
                </DowngradeConfirmationDialog>
              ) : planAction === "upgrade" && !hasScheduledDowngrade ? (
                <UpgradeConfirmationDialog
                  targetPlan={{
                    name: plan.name,
                    price: plan.price,
                    lookupKey: plan.lookupKey,
                  }}
                  currentPlan={{
                    name: currentPlan,
                    price: price.toString(),
                  }}
                >
                  <Button
                    className="w-full"
                    variant={finalActionVariant}
                    disabled={isActionDisabled}
                  >
                    {finalActionText}
                  </Button>
                </UpgradeConfirmationDialog>
              ) : hasScheduledDowngrade ? (
                <Button
                  className="w-full"
                  variant={finalActionVariant}
                  disabled={isActionDisabled}
                >
                  {finalActionText}
                </Button>
              ) : (
                <SubscribeButton
                  lookupKey={plan.lookupKey}
                  actionVariant={finalActionVariant}
                  disabled={isActionDisabled}
                  actionText={finalActionText}
                />
              )}
              {finalActionText === "Upgrade" && !hasScheduledDowngrade && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  You'll be charged a prorated amount for the remaining billing
                  period
                </p>
              )}
              {finalActionText === "Downgrade" && !hasScheduledDowngrade && (
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
              {hasScheduledDowngrade &&
                finalActionText === "Downgrade Scheduled" && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    A downgrade to {scheduledPlan?.plan} is already scheduled
                  </p>
                )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

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

import { CancelDowngradeDialog } from "./cancel-downgrade-dialog";
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
        const planAction = getPlanAction(
          currentPlan,
          plan.lookupKey,
          scheduledPlan?.plan ?? undefined,
        );
        const actionText = getPlanActionText(planAction);
        const actionVariant = getPlanActionVariant(planAction);

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

              {planAction === "downgrade" ||
              planAction === "change downgrade" ? (
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
                  <Button className="w-full" variant={actionVariant}>
                    {actionText}
                  </Button>
                </DowngradeConfirmationDialog>
              ) : planAction === "upgrade" ||
                planAction === "cancel downgrade and upgrade" ? (
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
                  <Button className="h-full w-full" variant={actionVariant}>
                    {actionText}
                  </Button>
                </UpgradeConfirmationDialog>
              ) : scheduledPlan && planAction === "cancel downgrade" ? (
                <CancelDowngradeDialog
                  currentPlan={{
                    name: currentPlan,
                    price: price.toString(),
                  }}
                  downgradedPlan={{
                    plan: scheduledPlan.plan!,
                    price: scheduledPlan.price,
                  }}
                >
                  <Button className="w-full" variant={actionVariant}>
                    {actionText}
                  </Button>
                </CancelDowngradeDialog>
              ) : hasScheduledDowngrade ? (
                <Button className="w-full" variant={actionVariant} disabled>
                  {actionText}
                </Button>
              ) : (
                <SubscribeButton
                  lookupKey={plan.lookupKey}
                  actionVariant={actionVariant}
                  disabled={false}
                  actionText={actionText}
                />
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

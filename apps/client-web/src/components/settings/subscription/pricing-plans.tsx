import { handleSubscriptionFormAction } from "@/actions";
import { getCurrentSubscriptionStatus } from "@/lib/get-subscription-data";
import { plans } from "@/utils/plans-data";
import {
  getPlanAction,
  getPlanActionText,
  getPlanActionVariant,
} from "@/utils/subscription-plan-helpers";
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

export default async function PricingPlans() {
  const subscriptionStatus = await getCurrentSubscriptionStatus();

  const getCurrentPlan = () => {
    if (!subscriptionStatus || subscriptionStatus.status === "none") {
      return null;
    }
    return plans.find((plan) => plan.lookupKey === subscriptionStatus.plan);
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => {
        const isCurrentPlan = currentPlan?.lookupKey === plan.lookupKey;
        const planAction = getPlanAction(
          subscriptionStatus?.plan,
          plan.lookupKey,
        );
        const actionText = getPlanActionText(planAction);
        const actionVariant = getPlanActionVariant(planAction);

        return (
          <Card
            key={plan.name}
            className={`relative ${isCurrentPlan ? "border-primary" : ""}`}
          >
            {plan.mostPopular && (
              <Badge className="absolute -top-2 right-2 bg-blue-100 text-blue-800">
                Most popular
              </Badge>
            )}
            {isCurrentPlan && !plan.mostPopular && (
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
              <form action={handleSubscriptionFormAction}>
                <input type="hidden" name="lookupKey" value={plan.lookupKey} />
                <Button
                  className="w-full"
                  variant={actionVariant}
                  disabled={isCurrentPlan}
                  type="submit"
                >
                  {actionText}
                </Button>
              </form>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

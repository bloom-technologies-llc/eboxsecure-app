import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

import { CancelSubscriptionDialog } from "./cancel-subscription-dialog";
import ManageBilling from "./manage-billing";
import ReactivateButton from "./reactivate-button";

export default async function BillingSection() {
  const { plan, subscriptionData } = await api.subscription.getCurrentPlan();
  if (!plan) {
    redirect("/payment");
  }

  return (
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
              {subscriptionData?.cancelAtPeriodEnd
                ? `Subscription will end on ${new Date(subscriptionData.currentPeriodEnd! * 1000).toLocaleDateString()}`
                : subscriptionData?.currentPeriodEnd
                  ? `Your subscription will automatically renew on ${new Date(subscriptionData.currentPeriodEnd * 1000).toLocaleDateString()}`
                  : "Manage your subscription billing details"}
            </p>
          </div>
          {subscriptionData?.cancelAtPeriodEnd ? (
            <ReactivateButton />
          ) : (
            <ManageBilling />
          )}
        </div>

        {subscriptionData?.status === "active" &&
          plan &&
          !subscriptionData?.cancelAtPeriodEnd && (
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-sm font-medium">Cancel Subscription</p>
                <p className="text-sm text-muted-foreground">
                  You can cancel anytime. Your plan will remain active until the
                  next billing cycle.
                </p>
              </div>
              <CancelSubscriptionDialog
                currentPlanName={plan}
                currentPeriodEnd={subscriptionData.currentPeriodEnd}
              />
            </div>
          )}
      </CardContent>
    </Card>
  );
}

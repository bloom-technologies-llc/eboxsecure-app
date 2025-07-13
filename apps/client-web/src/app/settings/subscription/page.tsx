import SettingsLayout from "@/components/settings/settings-layout";
import BillingSection from "@/components/settings/subscription/billing-section";
import CancellationBanner from "@/components/settings/subscription/cancellation-banner";
import CurrentPlanOverview from "@/components/settings/subscription/current-plan-overview";
import PricingPlans from "@/components/settings/subscription/pricing-plans";
import { Crown } from "lucide-react";

import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

export default function SubscriptionPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Cancellation Banner */}
        <CancellationBanner />

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
        <CurrentPlanOverview />

        {/* Available Plans */}
        <PricingPlans />

        {/* Billing Information */}
        <BillingSection />
      </div>
    </SettingsLayout>
  );
}

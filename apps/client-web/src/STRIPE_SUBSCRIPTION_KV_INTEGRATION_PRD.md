# Product Requirements Document (PRD)

## Stripe Subscription System KV Integration

### Executive Summary

This PRD outlines the implementation plan to align the current Stripe subscription system with the KV (Redis) store to provide real-time subscription status updates in the UI, enable dynamic upgrade/downgrade functionality, and implement subscription cancellation features.

### Current State Analysis

- **KV Store**: Currently stores subscription data via `syncCustomerData()` function
- **Webhook Integration**: Stripe webhooks trigger `syncCustomerData()` to update KV store
- **UI**: Static subscription page with hardcoded "current plan" status
- **Missing**: Dynamic subscription status retrieval from KV, upgrade/downgrade logic, cancellation functionality

### Subscription Tier Enum

To ensure type safety and consistency across the application, we'll use a centralized enum for subscription tiers:

```typescript
export enum SubscriptionTier {
  BASIC = "basic",
  BASIC_PRO = "basic_pro",
  PREMIUM = "premium",
  BUSINESS_PRO = "business_pro",
}
```

This enum will be used throughout the application to:

- Define valid subscription tiers
- Ensure type safety when comparing plans
- Provide a single source of truth for plan hierarchy
- Enable easy refactoring if plan names change

### Objectives

1. **Phase 1**: Implement KV-based subscription status checking and UI reflection
2. **Phase 2**: Add dynamic upgrade/downgrade functionality with appropriate copy
3. **Phase 3**: Implement subscription cancellation with proper user experience

---

## Phase 1: KV-Based Subscription Status Integration

### 1.1 Create Subscription Data Retrieval Functions

**File**: `apps/client-web/src/lib/get-subscription-data.ts`

```typescript
import "server-only";

import { currentUser } from "@clerk/nextjs/server";

import { kv } from "./redis";
import { SubscriptionData } from "./sync-customer-data";

export enum SubscriptionTier {
  BASIC = "basic",
  BASIC_PRO = "basic_pro",
  PREMIUM = "premium",
  BUSINESS_PRO = "business_pro",
}

export type SubscriptionStatus = {
  status:
    | "active"
    | "canceled"
    | "past_due"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "paused";
  plan?: SubscriptionTier;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
};

export async function getCurrentSubscriptionStatus(): Promise<SubscriptionStatus> {
  const user = await currentUser();
  if (!user?.privateMetadata?.stripeCustomerId) {
    return { status: "none" };
  }

  const customerId = user.privateMetadata.stripeCustomerId as string;
  const subscriptionData = await kv.get<SubscriptionData>(
    `stripe:customer:${customerId}`,
  );

  if (!subscriptionData || subscriptionData.status === "none") {
    return { status: "none" };
  }

  // Map price IDs to plan names
  const plan = mapPriceIdsToPlan(subscriptionData.priceIds);

  return {
    status: subscriptionData.status,
    plan,
    currentPeriodEnd: subscriptionData.currentPeriodEnd,
    cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
  };
}

function mapPriceIdsToPlan(priceIds: string[]): SubscriptionTier | undefined {
  const priceIdToPlanMap: Record<string, SubscriptionTier> = {
    price_1Re6nPPFcJwvZfVCIGbcwpCU: SubscriptionTier.BASIC,
    price_1Re6nPPFcJwvZfVC8pyDTQ6D: SubscriptionTier.BASIC_PRO,
    price_1Reh3nPFcJwvZfVCaw9leF9A: SubscriptionTier.PREMIUM,
    price_1Reh51PFcJwvZfVCUGj9UBbv: SubscriptionTier.BUSINESS_PRO,
  };

  for (const priceId of priceIds) {
    if (priceIdToPlanMap[priceId]) {
      return priceIdToPlanMap[priceId];
    }
  }

  return undefined;
}
```

### 1.2 Create Server Actions for Subscription Management

**File**: `apps/client-web/src/lib/subscription-actions.ts`

```typescript
"use server";

import { currentUser } from "@clerk/nextjs/server";

import { createStripeSession } from "./create-stripe-session";
import { getCurrentSubscriptionStatus } from "./get-subscription-data";

export async function upgradeSubscription(lookupKey: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const currentStatus = await getCurrentSubscriptionStatus();

  // Validate upgrade path
  if (currentStatus.status !== "active" && currentStatus.status !== "none") {
    throw new Error("Cannot upgrade subscription in current state");
  }

  return await createStripeSession(lookupKey as any);
}

export async function getSubscriptionInfo() {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  return await getCurrentSubscriptionStatus();
}
```

### 1.3 Update Subscription Page to Use KV Data

**File**: `apps/client-web/src/app/settings/subscription/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import SettingsLayout from "@/components/settings-layout";
import { upgradeSubscription, getSubscriptionInfo } from "@/lib/subscription-actions";
import type { SubscriptionStatus } from "@/lib/get-subscription-data";
import { Check, Crown, Zap, Loader2 } from "lucide-react";

// ... existing imports and plan definitions ...

export default function SubscriptionPage() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  async function loadSubscriptionStatus() {
    try {
      const status = await getSubscriptionInfo();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error("Failed to load subscription status:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgradeAction(formData: FormData) {
    const lookupKey = formData.get("lookupKey") as string;
    if (!lookupKey) return;

    setUpgrading(lookupKey);
    try {
      const url = await upgradeSubscription(lookupKey);
      if (url) redirect(url);
    } catch (error) {
      console.error("Upgrade failed:", error);
      // Handle error (show toast, etc.)
    } finally {
      setUpgrading(null);
    }
  }

  const getCurrentPlan = () => {
    if (!subscriptionStatus || subscriptionStatus.status === "none") {
      return null;
    }
    return plans.find(plan => plan.lookupKey === subscriptionStatus.plan);
  };

  const currentPlan = getCurrentPlan();

  if (loading) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </SettingsLayout>
    );
  }

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
        {currentPlan && (
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
                    <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionStatus.cancelAtPeriodEnd
                        ? `Cancels on ${new Date(subscriptionStatus.currentPeriodEnd! * 1000).toLocaleDateString()}`
                        : `Next billing date: ${new Date(subscriptionStatus.currentPeriodEnd! * 1000).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{currentPlan.price}</p>
                  <p className="text-sm text-muted-foreground">/month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.lookupKey === plan.lookupKey;
            const isUpgrading = upgrading === plan.lookupKey;

            return (
              <Card
                key={plan.name}
                className={`relative ${isCurrentPlan ? "border-primary" : ""}`}
              >
                {/* ... existing card structure ... */}
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
                      variant={isCurrentPlan ? "outline" : "primary"}
                      disabled={isCurrentPlan || isUpgrading}
                      type="submit"
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : (
                        "Upgrade"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ... rest of the component ... */}
      </div>
    </SettingsLayout>
  );
}
```

---

## Phase 2: Dynamic Upgrade/Downgrade Functionality

### 2.1 Enhanced Subscription Actions

**File**: `apps/client-web/src/lib/subscription-actions.ts` (Updated)

```typescript
"use server";

import { currentUser } from "@clerk/nextjs/server";

import { createStripeSession } from "./create-stripe-session";
import {
  getCurrentSubscriptionStatus,
  SubscriptionTier,
} from "./get-subscription-data";

export type PlanAction = "upgrade" | "downgrade" | "same";

export function determinePlanAction(
  currentPlan: SubscriptionTier | undefined,
  targetPlan: SubscriptionTier,
): PlanAction {
  const planHierarchy = [
    SubscriptionTier.BASIC,
    SubscriptionTier.BASIC_PRO,
    SubscriptionTier.PREMIUM,
    SubscriptionTier.BUSINESS_PRO,
  ];

  if (!currentPlan) return "upgrade";

  const currentIndex = planHierarchy.indexOf(currentPlan);
  const targetIndex = planHierarchy.indexOf(targetPlan);

  if (currentIndex === targetIndex) return "same";
  if (targetIndex > currentIndex) return "upgrade";
  return "downgrade";
}

export async function changeSubscription(lookupKey: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const currentStatus = await getCurrentSubscriptionStatus();
  const action = determinePlanAction(
    currentStatus.plan,
    lookupKey as SubscriptionTier,
  );

  // Validate action
  if (currentStatus.status !== "active" && currentStatus.status !== "none") {
    throw new Error("Cannot change subscription in current state");
  }

  if (action === "same") {
    throw new Error("Already on this plan");
  }

  return await createStripeSession(lookupKey as any);
}

export async function getSubscriptionInfo() {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  return await getCurrentSubscriptionStatus();
}
```

### 2.2 Updated Subscription Page with Dynamic Actions

**File**: `apps/client-web/src/app/settings/subscription/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import SettingsLayout from "@/components/settings-layout";
import { changeSubscription, determinePlanAction } from "@/lib/subscription-actions";
import { SubscriptionTier } from "@/lib/get-subscription-data";
import { Check, Crown, Zap, Loader2 } from "lucide-react";

export default function SubscriptionPage() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  async function loadSubscriptionStatus() {
    try {
      const status = await getSubscriptionInfo();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error("Failed to load subscription status:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePlanChange(formData: FormData) {
    const lookupKey = formData.get("lookupKey") as string;
    if (!lookupKey) return;

    const action = determinePlanAction(subscriptionStatus?.plan, lookupKey as SubscriptionTier);
    setUpgrading(lookupKey);

    try {
      const url = await changeSubscription(lookupKey);
      if (url) redirect(url);
    } catch (error) {
      console.error("Plan change failed:", error);
      // Handle error
    } finally {
      setUpgrading(null);
    }
  }

  const getActionButtonText = (planLookupKey: string) => {
    if (!subscriptionStatus) return "Subscribe";

    const action = determinePlanAction(subscriptionStatus.plan, planLookupKey as SubscriptionTier);

    switch (action) {
      case "upgrade":
        return "Upgrade";
      case "downgrade":
        return "Downgrade";
      case "same":
        return "Current Plan";
      default:
        return "Subscribe";
    }
  };

  const getActionButtonVariant = (planLookupKey: string) => {
    if (!subscriptionStatus) return "primary";

    const action = determinePlanAction(subscriptionStatus.plan, planLookupKey as SubscriptionTier);

    switch (action) {
      case "upgrade":
        return "primary";
      case "downgrade":
        return "outline";
      case "same":
        return "outline";
      default:
        return "primary";
    }
  };

  const getCurrentPlan = () => {
    if (!subscriptionStatus || subscriptionStatus.status === "none") {
      return null;
    }
    return plans.find(plan => plan.lookupKey === subscriptionStatus.plan);
  };

  const currentPlan = getCurrentPlan();

  if (loading) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </SettingsLayout>
    );
  }

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
        {currentPlan && (
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
                    <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionStatus.cancelAtPeriodEnd
                        ? `Cancels on ${new Date(subscriptionStatus.currentPeriodEnd! * 1000).toLocaleDateString()}`
                        : `Next billing date: ${new Date(subscriptionStatus.currentPeriodEnd! * 1000).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{currentPlan.price}</p>
                  <p className="text-sm text-muted-foreground">/month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.lookupKey === plan.lookupKey;
            const isUpgrading = upgrading === plan.lookupKey;

            return (
              <Card
                key={plan.name}
                className={`relative ${isCurrentPlan ? "border-primary" : ""}`}
              >
                {/* ... existing card structure ... */}
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <form action={handlePlanChange}>
                    <input
                      type="hidden"
                      name="lookupKey"
                      value={plan.lookupKey}
                    />
                    <Button
                      className="w-full"
                      variant={getActionButtonVariant(plan.lookupKey)}
                      disabled={determinePlanAction(subscriptionStatus?.plan, plan.lookupKey as SubscriptionTier) === "same" || isUpgrading}
                      type="submit"
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        getActionButtonText(plan.lookupKey)
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ... rest of the component ... */}
      </div>
    </SettingsLayout>
  );
}
```

---

## Phase 3: Subscription Cancellation

### 3.1 Create Cancellation Server Action

**File**: `apps/client-web/src/lib/subscription-actions.ts` (Updated)

```typescript
"use server";

import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

import {
  getCurrentSubscriptionStatus,
  SubscriptionTier,
} from "./get-subscription-data";

// ... existing functions ...

export async function cancelSubscription() {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const currentStatus = await getCurrentSubscriptionStatus();

  if (!currentStatus.subscriptionId) {
    throw new Error("No active subscription to cancel");
  }

  if (currentStatus.status !== "active") {
    throw new Error("Subscription is not in an active state");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Cancel at period end (soft cancel)
  await stripe.subscriptions.update(currentStatus.subscriptionId, {
    cancel_at_period_end: true,
  });

  // The webhook will update the KV store automatically
  return { success: true };
}

export async function reactivateSubscription() {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const currentStatus = await getCurrentSubscriptionStatus();

  if (!currentStatus.subscriptionId) {
    throw new Error("No subscription to reactivate");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Remove cancellation
  await stripe.subscriptions.update(currentStatus.subscriptionId, {
    cancel_at_period_end: false,
  });

  return { success: true };
}
```

### 3.2 Add Cancellation UI Components

**File**: `apps/client-web/src/components/subscription/cancellation-modal.tsx`

```typescript
"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@ebox/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ebox/ui/dialog";
import { cancelSubscription } from "@/lib/subscription-actions";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPlanName: string;
  currentPeriodEnd: number;
}

export function CancellationModal({
  isOpen,
  onClose,
  onSuccess,
  currentPlanName,
  currentPeriodEnd,
}: CancellationModalProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Cancellation failed:", error);
      // Handle error
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancel Subscription
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your {currentPlanName} subscription?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="font-medium mb-2">What happens when you cancel:</h4>
            <ul className="text-sm space-y-1">
              <li>• Your subscription will remain active until {new Date(currentPeriodEnd * 1000).toLocaleDateString()}</li>
              <li>• You'll continue to have access to all features until then</li>
              <li>• No further charges will be made</li>
              <li>• You can reactivate anytime before the end date</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCancelling}>
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Cancel Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 3.3 Update Subscription Page with Cancellation

**File**: `apps/client-web/src/app/settings/subscription/page.tsx` (Updated)

```typescript
"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import SettingsLayout from "@/components/settings-layout";
import { changeSubscription, determinePlanAction } from "@/lib/subscription-actions";
import { SubscriptionTier } from "@/lib/get-subscription-data";
import { Check, Crown, Zap, Loader2 } from "lucide-react";
import { CancellationModal } from "@/components/subscription/cancellation-modal";
import { reactivateSubscription } from "@/lib/subscription-actions";

export default function SubscriptionPage() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  async function loadSubscriptionStatus() {
    try {
      const status = await getSubscriptionInfo();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error("Failed to load subscription status:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePlanChange(formData: FormData) {
    const lookupKey = formData.get("lookupKey") as string;
    if (!lookupKey) return;

    const action = determinePlanAction(subscriptionStatus?.plan, lookupKey as SubscriptionTier);
    setUpgrading(lookupKey);

    try {
      const url = await changeSubscription(lookupKey);
      if (url) redirect(url);
    } catch (error) {
      console.error("Plan change failed:", error);
      // Handle error
    } finally {
      setUpgrading(null);
    }
  }

  const getActionButtonText = (planLookupKey: string) => {
    if (!subscriptionStatus) return "Subscribe";

    const action = determinePlanAction(subscriptionStatus.plan, planLookupKey as SubscriptionTier);

    switch (action) {
      case "upgrade":
        return "Upgrade";
      case "downgrade":
        return "Downgrade";
      case "same":
        return "Current Plan";
      default:
        return "Subscribe";
    }
  };

  const getActionButtonVariant = (planLookupKey: string) => {
    if (!subscriptionStatus) return "primary";

    const action = determinePlanAction(subscriptionStatus.plan, planLookupKey as SubscriptionTier);

    switch (action) {
      case "upgrade":
        return "primary";
      case "downgrade":
        return "outline";
      case "same":
        return "outline";
      default:
        return "primary";
    }
  };

  const getCurrentPlan = () => {
    if (!subscriptionStatus || subscriptionStatus.status === "none") {
      return null;
    }
    return plans.find(plan => plan.lookupKey === subscriptionStatus.plan);
  };

  const currentPlan = getCurrentPlan();

  async function handleReactivate() {
    setReactivating(true);
    try {
      await reactivateSubscription();
      await loadSubscriptionStatus(); // Refresh data
    } catch (error) {
      console.error("Reactivation failed:", error);
    } finally {
      setReactivating(false);
    }
  }

  if (loading) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </SettingsLayout>
    );
  }

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
        {currentPlan && (
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
                    <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionStatus.cancelAtPeriodEnd
                        ? `Cancels on ${new Date(subscriptionStatus.currentPeriodEnd! * 1000).toLocaleDateString()}`
                        : `Next billing date: ${new Date(subscriptionStatus.currentPeriodEnd! * 1000).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{currentPlan.price}</p>
                  <p className="text-sm text-muted-foreground">/month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.lookupKey === plan.lookupKey;
            const isUpgrading = upgrading === plan.lookupKey;

            return (
              <Card
                key={plan.name}
                className={`relative ${isCurrentPlan ? "border-primary" : ""}`}
              >
                {/* ... existing card structure ... */}
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <form action={handlePlanChange}>
                    <input
                      type="hidden"
                      name="lookupKey"
                      value={plan.lookupKey}
                    />
                    <Button
                      className="w-full"
                      variant={getActionButtonVariant(plan.lookupKey)}
                      disabled={determinePlanAction(subscriptionStatus?.plan, plan.lookupKey as SubscriptionTier) === "same" || isUpgrading}
                      type="submit"
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        getActionButtonText(plan.lookupKey)
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
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
                  {subscriptionStatus?.cancelAtPeriodEnd
                    ? `Subscription will end on ${new Date(subscriptionStatus.currentPeriodEnd! * 1000).toLocaleDateString()}`
                    : `Your subscription will automatically renew on ${new Date(subscriptionStatus?.currentPeriodEnd! * 1000).toLocaleDateString()}`
                  }
                </p>
              </div>
              {subscriptionStatus?.cancelAtPeriodEnd ? (
                <Button
                  variant="outline"
                  onClick={handleReactivate}
                  disabled={reactivating}
                >
                  {reactivating ? "Reactivating..." : "Reactivate"}
                </Button>
              ) : (
                <Button variant="outline">Manage Billing</Button>
              )}
            </div>

            {subscriptionStatus?.status === "active" && (
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
                  onClick={() => setShowCancellationModal(true)}
                >
                  Cancel Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancellation Modal */}
        {subscriptionStatus && (
          <CancellationModal
            isOpen={showCancellationModal}
            onClose={() => setShowCancellationModal(false)}
            onSuccess={loadSubscriptionStatus}
            currentPlanName={currentPlan?.name || "Current"}
            currentPeriodEnd={subscriptionStatus.currentPeriodEnd!}
          />
        )}
      </div>
    </SettingsLayout>
  );
}
```

---

## Implementation Timeline

### Phase 1 (Week 1-2)

- [ ] Create `get-subscription-data.ts` with KV retrieval functions
- [ ] Create `subscription-actions.ts` server actions
- [ ] Update subscription page to use KV data
- [ ] Test subscription status display

### Phase 2 (Week 3)

- [ ] Enhance subscription actions with upgrade/downgrade logic
- [ ] Update UI with dynamic button text and variants
- [ ] Test upgrade/downgrade flows

### Phase 3 (Week 4)

- [ ] Implement cancellation server actions
- [ ] Create cancellation modal component
- [ ] Add reactivation functionality
- [ ] Test cancellation and reactivation flows

### Testing & Deployment (Week 5)

- [ ] End-to-end testing of all flows
- [ ] Error handling and edge cases
- [ ] Performance testing with KV store
- [ ] Production deployment

---

## Technical Considerations

### 1. Price ID Mapping

You'll need to create a mapping between Stripe price IDs and `SubscriptionTier` enum values. This can be done by:

- Adding metadata to Stripe products/prices that corresponds to `SubscriptionTier` values
- Creating a configuration file with price ID to `SubscriptionTier` mappings
- Using Stripe's lookup keys (recommended) that align with enum values

### 2. Type Safety with SubscriptionTier Enum

- Use the `SubscriptionTier` enum consistently across all components and functions
- Leverage TypeScript's type checking to prevent invalid plan comparisons
- The enum provides a single source of truth for valid subscription tiers
- Easy refactoring if plan names or hierarchy changes

### 3. Error Handling

- Handle cases where KV store is unavailable
- Graceful degradation when subscription data is missing
- User-friendly error messages for failed operations
- Type-safe error handling with enum validation

### 4. Performance

- KV store provides fast access to subscription data
- Consider caching frequently accessed data
- Implement proper loading states
- Enum-based lookups are O(1) and highly performant

### 5. Security

- All server actions validate user authentication
- Proper error handling to prevent information leakage
- Validate subscription state before operations
- Type-safe plan validation using the enum

### 6. Data Consistency

- KV store is updated via webhooks for real-time consistency
- Fallback to Stripe API if KV data is stale
- Implement retry logic for failed operations
- Enum ensures consistent plan representation across systems

---

## Success Metrics

### Phase 1 Success Criteria

- [ ] Subscription status loads from KV store within 500ms
- [ ] UI correctly reflects current subscription state
- [ ] No errors when KV store is unavailable (graceful fallback)

### Phase 2 Success Criteria

- [ ] Upgrade/downgrade buttons show correct text based on current plan
- [ ] Plan changes are processed successfully
- [ ] Users can navigate between plans seamlessly

### Phase 3 Success Criteria

- [ ] Cancellation flow works end-to-end
- [ ] Users can reactivate cancelled subscriptions
- [ ] Cancellation status is reflected in UI immediately

### Overall Success Metrics

- [ ] 99.9% uptime for subscription status display
- [ ] < 1 second response time for subscription operations
- [ ] Zero data loss during subscription changes
- [ ] Positive user feedback on subscription management experience

---

## Risk Mitigation

### High-Risk Scenarios

1. **KV Store Outage**: Implement fallback to Stripe API
2. **Webhook Failures**: Add retry logic and manual sync capabilities
3. **Race Conditions**: Use optimistic updates with rollback capability
4. **Data Inconsistency**: Implement data validation and reconciliation

### Monitoring & Alerting

- Monitor KV store availability and performance
- Alert on webhook failures
- Track subscription operation success rates
- Monitor user experience metrics

---

This PRD provides a comprehensive roadmap for implementing a robust, KV-based subscription system that aligns with your current architecture while providing the dynamic functionality you need.

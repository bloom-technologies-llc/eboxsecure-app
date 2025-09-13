import { SubscriptionType } from "@prisma/client";

export type PlanAction =
  | "current"
  | "upgrade"
  | "downgrade"
  | "cancel downgrade"
  | "change downgrade"
  | "cancel downgrade and upgrade";

// Define plan hierarchy (from lowest to highest)
const PLAN_HIERARCHY = [
  SubscriptionType.BASIC,
  SubscriptionType.BASIC_PLUS,
  SubscriptionType.PREMIUM,
  SubscriptionType.BUSINESS_PRO,
] as const;

export function getPlanAction(
  currentPlan: SubscriptionType,
  targetPlan: SubscriptionType,
  scheduledPlan?: SubscriptionType,
): PlanAction {
  if (currentPlan === targetPlan) {
    return "current";
  }
  if (targetPlan === scheduledPlan) {
    return "cancel downgrade";
  }

  const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan);
  const targetIndex = PLAN_HIERARCHY.indexOf(targetPlan);
  const isUpgrading = targetIndex > currentIndex;

  if (isUpgrading) {
    return scheduledPlan ? "cancel downgrade and upgrade" : "upgrade";
  } else {
    return scheduledPlan ? "change downgrade" : "downgrade";
  }
}

export function getPlanActionText(action: PlanAction): string {
  switch (action) {
    case "current":
      return "Current Plan";
    case "upgrade":
      return "Upgrade";
    case "downgrade":
      return "Downgrade";
    case "cancel downgrade":
      return "Cancel Downgrade";
    case "change downgrade":
      return "Change Downgrade";
    case "cancel downgrade and upgrade":
      return "Cancel Downgrade and Upgrade";
    default:
      return "Subscribe";
  }
}

export function getPlanActionVariant(
  action: PlanAction,
): "primary" | "outline" {
  switch (action) {
    case "current":
      return "outline";
    case "upgrade":
      return "primary";
    case "downgrade":
      return "outline";
    case "cancel downgrade":
      return "outline";
    case "change downgrade":
      return "outline";
    case "cancel downgrade and upgrade":
      return "primary";
    default:
      return "primary";
  }
}

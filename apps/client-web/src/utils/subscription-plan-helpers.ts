import { Plan, PlanAction } from "@/types/subscription";

// Define plan hierarchy (from lowest to highest)
const PLAN_HIERARCHY = [
  Plan.BASIC,
  Plan.BASIC_PLUS,
  Plan.PREMIUM,
  Plan.BUSINESS_PRO,
] as const;

export function getPlanAction(
  currentPlan: Plan | undefined,
  targetPlan: Plan,
): PlanAction {
  if (!currentPlan) {
    return "subscribe";
  }

  if (currentPlan === targetPlan) {
    return "current";
  }

  const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan);
  const targetIndex = PLAN_HIERARCHY.indexOf(targetPlan);

  if (targetIndex > currentIndex) {
    return "upgrade";
  } else {
    return "downgrade";
  }
}

export function getPlanActionText(action: PlanAction): string {
  switch (action) {
    case "subscribe":
      return "Subscribe";
    case "current":
      return "Current Plan";
    case "upgrade":
      return "Upgrade";
    case "downgrade":
      return "Downgrade";
    default:
      return "Subscribe";
  }
}

export function getPlanActionVariant(
  action: PlanAction,
): "primary" | "outline" {
  switch (action) {
    case "subscribe":
    case "upgrade":
      return "primary";
    case "current":
    case "downgrade":
      return "outline";
    default:
      return "primary";
  }
}

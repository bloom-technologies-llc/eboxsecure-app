export enum Plan {
  BASIC = "basic",
  BASIC_PLUS = "basic_plus",
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
    | "paused"
    | "none";
  plan?: Plan;
  currentPeriodEnd?: number;
  currentPeriodStart?: number;
  cancelAtPeriodEnd?: boolean;
  subscriptionId?: string;
};

export type PlanAction = "subscribe" | "current" | "upgrade" | "downgrade";

export type SubscriptionData = {
  subscriptionId: string;
  status:
    | "active"
    | "canceled"
    | "past_due"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "paused"
    | "none";
  priceIds: string[];
  currentPeriodEnd: number;
  currentPeriodStart: number;
  cancelAtPeriodEnd: boolean;
};

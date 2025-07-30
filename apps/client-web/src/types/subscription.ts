export enum Plan {
  BASIC = "basic",
  BASIC_PLUS = "basic_plus",
  PREMIUM = "premium",
  BUSINESS_PRO = "business_pro",
}

// Must be equal to the SubscriptionType enum in the client-api package
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

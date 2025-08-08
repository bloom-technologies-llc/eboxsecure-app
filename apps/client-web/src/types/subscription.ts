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
  schedule?: {
    scheduleId: string;
    startDate: number;
    endDate: number;
    items: {
      price: string;
    }[];
  };
};

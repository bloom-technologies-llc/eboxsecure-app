import { SubscriptionType } from "@prisma/client";

type Plan = {
  name: string;
  description: string;
  lookupKey: SubscriptionType;
  features: string[];
  mostPopular?: boolean;
  prices: {
    month: {
      price: string;
    };
    year: {
      price: string;
    };
  };
};

export const plans: Plan[] = [
  {
    name: "Basic",
    prices: {
      month: {
        price: "$9.99",
      },
      year: {
        price: "$102",
      },
    },
    description: "Perfect for individuals with occasional package deliveries.",
    lookupKey: SubscriptionType.BASIC,
    features: [
      "Access to 3 EboxSecure locations",
      "2-day package holding",
      "Maximum 5 packages",
      "Standard support",
    ],
    mostPopular: false,
  },
  {
    name: "Basic+",
    prices: {
      month: {
        price: "$19.99",
      },
      year: {
        price: "$204",
      },
    },
    description: "Great for regular online shoppers with more delivery needs.",
    lookupKey: SubscriptionType.BASIC_PLUS,
    features: [
      "Access to 25 EboxSecure locations",
      "5-day package holding",
      "Maximum 20 packages",
      "Standard support",
    ],
  },
  {
    name: "Premium",
    prices: {
      month: {
        price: "$49.99",
      },
      year: {
        price: "$510",
      },
    },
    description: "Ideal for small businesses with regular deliveries.",
    mostPopular: true,
    lookupKey: SubscriptionType.PREMIUM,
    features: [
      "Access to 75 EboxSecure locations",
      "7-day package holding",
      "Maximum 50 packages",
      "Priority support",
      "Returns handling",
      "Discounted last-mile delivery service",
    ],
  },
  {
    name: "Business Pro",
    prices: {
      month: {
        price: "$99.99",
      },
      year: {
        price: "$1020",
      },
    },
    description: "For businesses with high-volume delivery needs.",
    lookupKey: SubscriptionType.BUSINESS_PRO,
    features: [
      "Unlimited EboxSecure locations",
      "10-day package holding",
      "Maximum 200 packages",
      "Priority support",
      "Returns handling",
      "Discounted last-mile delivery service",
      "Dedicated account management",
    ],
  },
];

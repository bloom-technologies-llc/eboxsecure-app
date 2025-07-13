import { SubscriptionTier } from "@/types/subscription";

export const plans = [
  {
    name: "Basic",
    price: "$9.99",
    period: "/month",
    description: "Perfect for individuals with occasional package deliveries.",
    lookupKey: SubscriptionTier.BASIC,
    features: [
      "Access to 3 EboxSecure locations",
      "2-day package holding",
      "Maximum 5 packages",
      "Standard support",
    ],
  },
  {
    name: "Basic+",
    price: "$19.99",
    period: "/month",
    description: "Great for regular online shoppers with more delivery needs.",
    lookupKey: SubscriptionTier.BASIC_PLUS,
    features: [
      "Access to 25 EboxSecure locations",
      "5-day package holding",
      "Maximum 20 packages",
      "Standard support",
    ],
  },
  {
    name: "Premium",
    price: "$49.99",
    period: "/month",
    description: "Ideal for small businesses with regular deliveries.",
    mostPopular: true,
    lookupKey: SubscriptionTier.PREMIUM,
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
    price: "$99.99",
    period: "/month",
    description: "For businesses with high-volume delivery needs.",
    lookupKey: SubscriptionTier.BUSINESS_PRO,
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

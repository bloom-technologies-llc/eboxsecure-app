import { Check, X } from "lucide-react";

import { Container } from "@ebox/ui/container";

type TierValue = string | boolean;

type TierName = "Basic" | "Basic+" | "Premium" | "Business Pro";

interface FeatureTiers {
  Basic: TierValue;
  "Basic+": TierValue;
  Premium: TierValue;
  "Business Pro": TierValue;
  [key: string]: TierValue;
}

interface Feature {
  name: string;
  tiers: FeatureTiers;
}

const features: Feature[] = [
  {
    name: "Package Capacity",
    tiers: {
      Basic: "5 packages",
      "Basic+": "20 packages",
      Premium: "50 packages",
      "Business Pro": "200 packages",
    },
  },
  {
    name: "Location Access",
    tiers: {
      Basic: "3 locations",
      "Basic+": "25 locations",
      Premium: "75 locations",
      "Business Pro": "Unlimited",
    },
  },
  {
    name: "Package Holding Period",
    tiers: {
      Basic: "2 days",
      "Basic+": "5 days",
      Premium: "7 days",
      "Business Pro": "10 days",
    },
  },
  {
    name: "Support Level",
    tiers: {
      Basic: "Standard",
      "Basic+": "Standard",
      Premium: "Priority",
      "Business Pro": "Priority",
    },
  },
  {
    name: "Returns Handling",
    tiers: {
      Basic: false,
      "Basic+": false,
      Premium: true,
      "Business Pro": true,
    },
  },
  {
    name: "Last-Mile Delivery",
    tiers: {
      Basic: false,
      "Basic+": false,
      Premium: "Discounted",
      "Business Pro": "Discounted",
    },
  },
  {
    name: "Dedicated Account Manager",
    tiers: {
      Basic: false,
      "Basic+": false,
      Premium: false,
      "Business Pro": true,
    },
  },
  {
    name: "API Access",
    tiers: {
      Basic: false,
      "Basic+": false,
      Premium: "Basic",
      "Business Pro": "Advanced",
    },
  },
];

export function PricingComparison() {
  return (
    <div className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Compare Plans
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            A detailed comparison of all features available in each pricing
            tier.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl">
          <div className="isolate overflow-hidden rounded-xl">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="bg-background py-6 pl-6 text-sm font-semibold text-foreground"
                  >
                    <span className="sr-only">Feature</span>
                  </th>
                  <th
                    scope="col"
                    className="bg-background px-6 py-6 text-sm font-semibold text-foreground"
                  >
                    Basic
                  </th>
                  <th
                    scope="col"
                    className="bg-background px-6 py-6 text-sm font-semibold text-foreground"
                  >
                    Basic+
                  </th>
                  <th
                    scope="col"
                    className="bg-primary/10 px-6 py-6 text-sm font-semibold text-foreground"
                  >
                    Premium
                  </th>
                  <th
                    scope="col"
                    className="bg-background px-6 py-6 text-sm font-semibold text-foreground"
                  >
                    Business Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, featureIdx) => (
                  <tr key={feature.name}>
                    <th
                      scope="row"
                      className={`bg-background py-6 pl-6 text-sm font-semibold text-foreground ${
                        featureIdx === features.length - 1
                          ? ""
                          : "border-b border-border/10"
                      }`}
                    >
                      {feature.name}
                    </th>
                    {["Basic", "Basic+", "Premium", "Business Pro"].map(
                      (tier) => (
                        <td
                          key={tier}
                          className={`px-6 py-6 text-sm ${
                            tier === "Premium"
                              ? "bg-primary/10"
                              : "bg-background"
                          } ${
                            featureIdx === features.length - 1
                              ? ""
                              : "border-b border-border/10"
                          }`}
                        >
                          {typeof feature.tiers[tier] === "boolean" ? (
                            feature.tiers[tier] ? (
                              <Check
                                className="h-5 w-5 text-primary"
                                aria-hidden="true"
                              />
                            ) : (
                              <X
                                className="h-5 w-5 text-muted-foreground"
                                aria-hidden="true"
                              />
                            )
                          ) : (
                            <span
                              className={
                                tier === "Premium"
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }
                            >
                              {feature.tiers[tier]}
                            </span>
                          )}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </div>
  );
}

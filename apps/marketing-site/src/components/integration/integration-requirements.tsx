import { Check, X } from "lucide-react";

import { Container } from "../ui/container";

const requirements = [
  {
    category: "Shopify Integration",
    items: [
      { name: "Shopify Basic plan or higher", supported: true },
      { name: "Shopify Checkout enabled", supported: true },
      { name: "Custom checkout scripts", supported: false },
      { name: "Shopify Payments", supported: true },
      { name: "Third-party payment providers", supported: true },
    ],
  },
  {
    category: "API Requirements",
    items: [
      { name: "HTTPS support", supported: true },
      { name: "JSON data format", supported: true },
      { name: "OAuth 2.0", supported: true },
      { name: "Webhook support", supported: true },
      { name: "Rate limit: 100 requests/minute", supported: true },
    ],
  },
  {
    category: "Platform Compatibility",
    items: [
      { name: "Shopify", supported: true },
      { name: "WooCommerce", supported: true },
      { name: "Magento", supported: true },
      { name: "BigCommerce", supported: true },
      { name: "Custom e-commerce platforms", supported: true },
    ],
  },
];

export function IntegrationRequirements() {
  return (
    <div className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Compatibility
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Technical Requirements
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Review the technical requirements and compatibility information to
            ensure EboxSecure will work with your existing systems.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {requirements.map((category) => (
              <div
                key={category.category}
                className="rounded-xl bg-background p-8 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-foreground">
                  {category.category}
                </h3>
                <ul className="mt-6 space-y-4">
                  {category.items.map((item) => (
                    <li key={item.name} className="flex items-start">
                      <div className="flex-shrink-0">
                        {item.supported ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <p className="ml-3 text-sm text-muted-foreground">
                        {item.name}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl bg-muted/50 p-8">
            <h3 className="text-lg font-semibold text-foreground">
              Additional Notes
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                • All integrations require HTTPS for secure communication.
              </li>
              <li>
                • API access requires an active EboxSecure Business or
                Enterprise plan.
              </li>
              <li>
                • Custom integrations may require additional development
                resources.
              </li>
              <li>
                • Our team is available to assist with integration challenges.
              </li>
              <li>
                • Regular API updates are released quarterly with backward
                compatibility.
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}

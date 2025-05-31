import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@ebox/ui/button";
import { Container } from "@ebox/ui/container";

const caseStudies = [
  {
    title: "How Fashion Retailer Reduced Delivery Issues by 95%",
    description:
      "Learn how a leading fashion retailer implemented EboxSecure to virtually eliminate delivery failures and improve customer satisfaction.",
    metrics: [
      { label: "Delivery Success Rate", value: "99.8%" },
      { label: "Customer Satisfaction", value: "+42%" },
      { label: "Reshipment Costs", value: "-95%" },
    ],
    link: "#",
    comingSoon: true,
  },
  {
    title: "Electronics Store Saves $25,000 Monthly in Shipping Costs",
    description:
      "Discover how a national electronics retailer reduced shipping costs and improved delivery reliability with EboxSecure integration.",
    metrics: [
      { label: "Monthly Savings", value: "$25,000" },
      { label: "Failed Deliveries", value: "-98%" },
      { label: "Customer Retention", value: "+18%" },
    ],
    link: "#",
    comingSoon: true,
  },
  {
    title: "Small Boutique Expands Customer Base with Secure Delivery",
    description:
      "See how a small specialty boutique attracted new customers and reduced delivery complaints by offering EboxSecure as a delivery option.",
    metrics: [
      { label: "New Customers", value: "+22%" },
      { label: "Delivery Complaints", value: "-87%" },
      { label: "Repeat Purchases", value: "+35%" },
    ],
    link: "#",
    comingSoon: true,
  },
];

export function PartnerCaseStudies() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Success Stories
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Partner Case Studies
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            See how retailers are achieving remarkable results with EboxSecure
            integration. These case studies showcase real-world benefits and
            ROI.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {caseStudies.map((study) => (
            <div
              key={study.title}
              className="flex flex-col overflow-hidden rounded-lg shadow-lg"
            >
              <div className="flex-1 bg-muted/30 p-6">
                <div className="flex items-center">
                  <h3 className="text-xl font-semibold text-foreground">
                    {study.title}
                  </h3>
                  {study.comingSoon && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="mt-4 text-base text-muted-foreground">
                  {study.description}
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {study.metrics.map((metric) => (
                    <div key={metric.label}>
                      <p className="text-2xl font-bold text-primary">
                        {metric.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex bg-background p-6">
                <Button asChild variant="outline" className="w-full">
                  <Link
                    href={study.link}
                    className="flex items-center justify-center"
                  >
                    <span>Read Full Case Study</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

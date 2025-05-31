"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Container } from "../ui/container";

const faqs = [
  {
    question: "How does the free trial work?",
    answer:
      "All plans include a 14-day free trial with full access to all features in your selected tier. No credit card is required to start your trial. You'll receive a reminder email 3 days before your trial ends.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades will take effect at the end of your current billing cycle.",
  },
  {
    question: "Is there a setup fee?",
    answer:
      "No, there are no setup fees for any of our plans. You only pay the monthly or annual subscription fee.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Yes, we offer annual billing with a discount equivalent to 2 months free compared to monthly billing.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express, Discover) as well as PayPal for subscription payments.",
  },
  {
    question: "What happens if I exceed my package limit?",
    answer:
      "If you exceed your package limit, you'll be charged a small fee per additional package. We'll always notify you before charging any overage fees.",
  },
  {
    question: "Can I get a custom plan for my business?",
    answer:
      "Yes, for businesses with unique needs or very high volume requirements, we offer custom enterprise plans. Please contact our sales team to discuss your specific requirements.",
  },
  {
    question: "Is there a discount for non-profits?",
    answer:
      "Yes, we offer special pricing for registered non-profit organizations. Please contact our sales team with proof of your non-profit status to learn more.",
  },
];

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-background py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Find answers to common questions about our pricing and plans.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl divide-y divide-border">
          {faqs.map((faq, index) => (
            <div key={index} className="py-6">
              <button
                className="flex w-full items-start justify-between text-left"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-base font-semibold leading-7 text-foreground">
                  {faq.question}
                </span>
                <span className="ml-6 flex h-7 items-center">
                  <ChevronDown
                    className={`h-6 w-6 transform text-primary transition-transform duration-200 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </button>
              {openIndex === index && (
                <div className="mt-2 pr-12">
                  <p className="text-base leading-7 text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

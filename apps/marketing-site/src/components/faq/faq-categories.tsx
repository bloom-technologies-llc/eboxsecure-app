"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Container } from "../ui/container";

const faqCategories = [
  {
    name: "How EboxSecure Works",
    questions: [
      {
        question: "How do I get my virtual address?",
        answer:
          "After signing up for an EboxSecure account, you'll be assigned a unique virtual address that includes a personal identifier. This address will be in the format: 123 Main St, UID-12345, Carmel IN. You can find this address in your account dashboard.",
      },
      {
        question: "How do I use my virtual address for deliveries?",
        answer:
          "Simply enter your assigned EboxSecure virtual address as the shipping address during checkout at any online retailer. The package will be delivered to our secure warehouse, and you'll receive a notification when it arrives.",
      },
      {
        question: "How does the Shopify app integration work?",
        answer:
          "When shopping at a retailer that has integrated our Shopify app, you'll see EboxSecure as a delivery option during checkout. Select this option, choose your preferred warehouse location, and the shipping fields will be automatically populated.",
      },
      {
        question: "How do I pick up my packages?",
        answer:
          "Once your package arrives at our warehouse, you'll receive a notification. Visit the location during business hours, show your ID and the pickup QR code from your EboxSecure app, and our staff will retrieve your package.",
      },
    ],
  },
  {
    name: "Pricing and Billing",
    questions: [
      {
        question: "Can I change my subscription plan?",
        answer:
          "Yes, you can upgrade or downgrade your plan at any time through your account dashboard. Upgrades take effect immediately, while downgrades will take effect at the end of your current billing cycle.",
      },
      {
        question: "Is there a free trial?",
        answer:
          "Yes, all new accounts come with a 14-day free trial. You can try any plan during this period without being charged.",
      },
      {
        question: "What happens if I exceed my package limit?",
        answer:
          "If you exceed your monthly package limit, you'll be charged a small fee per additional package. You'll always be notified before any overage charges are applied.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "We offer a 30-day money-back guarantee if you're not satisfied with our service. After this period, we do not provide refunds for unused portions of your subscription.",
      },
    ],
  },
  {
    name: "Package Handling and Security",
    questions: [
      {
        question: "How secure are the warehouse locations?",
        answer:
          "Our warehouses feature 24/7 security monitoring, controlled access, and comprehensive video surveillance. All packages are stored in a secure area accessible only by authorized personnel.",
      },
      {
        question: "Is there a size or weight limit for packages?",
        answer:
          "Standard packages up to 50 lbs and 3 cubic feet are accepted with all plans. For larger items, Premium and Business Pro plans include oversized package handling. Contact customer support for special handling requirements.",
      },
      {
        question: "How long can packages be held?",
        answer:
          "Package holding periods vary by plan: Basic (2 days), Basic+ (5 days), Premium (7 days), and Business Pro (10 days). Extensions are available for a small fee.",
      },
      {
        question: "What happens to packages that aren't picked up?",
        answer:
          "If packages aren't picked up within your plan's holding period, we'll contact you about extending the holding time for a fee. After 30 days, unclaimed packages may be returned to the sender.",
      },
    ],
  },
  {
    name: "Supported Carriers and Retailers",
    questions: [
      {
        question: "What carriers do you accept?",
        answer:
          "We accept packages from all major carriers, including USPS, UPS, FedEx, DHL, Amazon Logistics, and regional carriers. Our virtual address system works with any carrier that delivers to commercial addresses.",
      },
      {
        question: "Can I use EboxSecure for international shipments?",
        answer:
          "Yes, we accept international shipments. Please note that you are responsible for any customs duties or import taxes, which must be paid before package release.",
      },
      {
        question: "Which retailers work with the Shopify app?",
        answer:
          "Any retailer using Shopify as their e-commerce platform can integrate with our app. Check our Partners page for a list of retailers already offering EboxSecure as a delivery option.",
      },
      {
        question: "Can I use EboxSecure for Amazon deliveries?",
        answer:
          "Yes, simply enter your EboxSecure virtual address as the shipping address during Amazon checkout. We accept all Amazon packages, including those delivered by Amazon Logistics.",
      },
    ],
  },
];

export function FAQCategories() {
  const [openCategory, setOpenCategory] = useState<number | null>(0);
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index);
    setOpenQuestion(null);
  };

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div
                key={category.name}
                className="rounded-xl bg-background shadow-sm"
              >
                <button
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                  onClick={() => toggleCategory(categoryIndex)}
                >
                  <h2 className="text-xl font-semibold text-foreground">
                    {category.name}
                  </h2>
                  <ChevronDown
                    className={`h-5 w-5 transform text-primary transition-transform duration-200 ${
                      openCategory === categoryIndex ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openCategory === categoryIndex && (
                  <div className="divide-y divide-border/10 px-6 pb-6">
                    {category.questions.map((faq, questionIndex) => (
                      <div key={faq.question} className="py-4">
                        <button
                          className="flex w-full items-start justify-between text-left"
                          onClick={() => toggleQuestion(questionIndex)}
                        >
                          <span className="text-base font-medium text-foreground">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 transform text-primary transition-transform duration-200 ${
                              openQuestion === questionIndex ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {openQuestion === questionIndex && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

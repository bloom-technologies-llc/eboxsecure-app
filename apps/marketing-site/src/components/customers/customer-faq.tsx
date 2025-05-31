import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ebox/ui/accordion";

import { Container } from "../ui/container";

const faqs = [
  {
    question: "How much does EboxSecure cost?",
    answer:
      "EboxSecure offers flexible pricing plans to suit different needs. Our basic plan starts at $9.99 per month for up to 5 packages, with additional packages at $2 each. We also offer premium plans for frequent shoppers with unlimited packages. Visit our pricing page for detailed information.",
  },
  {
    question: "How long will you hold my packages?",
    answer:
      "We hold packages for up to 14 days at no additional charge. After 14 days, a small daily storage fee applies. We'll send you reminders as you approach the 14-day mark to ensure you don't incur additional charges.",
  },
  {
    question: "Can I use EboxSecure for any online retailer?",
    answer:
      "Yes! One of the biggest advantages of EboxSecure is that you can use your virtual address with any retailer that ships to residential addresses. There's no need for the retailer to integrate with our system.",
  },
  {
    question: "What happens if I'm not available to pick up my package?",
    answer:
      "No problem! Your package remains secure in our warehouse until you're ready to pick it up during our business hours. You can also authorize someone else to pick up your package by adding them to your account.",
  },
  {
    question: "How do I know when my package has arrived?",
    answer:
      "You'll receive real-time notifications via email and/or text message (based on your preferences) when your package arrives at our facility and is ready for pickup.",
  },
  {
    question: "What identification do I need to pick up my package?",
    answer:
      "You'll need to present a valid government-issued photo ID that matches the name on your account. You'll also need to show the pickup QR code that we send you when your package is ready.",
  },
  {
    question: "Can I ship from EboxSecure as well as receive packages?",
    answer:
      "Currently, EboxSecure is focused on inbound package delivery. However, we're working on adding outbound shipping services in the future. Stay tuned for updates!",
  },
  {
    question: "What if my package is damaged when I pick it up?",
    answer:
      "We inspect all packages upon arrival for visible damage. If damage is detected, we'll notify you immediately. For damage discovered during pickup, we'll help you file a claim with the carrier or retailer.",
  },
];

export function CustomerFAQ() {
  return (
    <div className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-4xl divide-y divide-muted">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <dl className="mt-10 space-y-6 divide-y divide-muted">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </dl>
        </div>
      </Container>
    </div>
  );
}

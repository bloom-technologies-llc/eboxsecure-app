"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Info,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Button } from "@ebox/ui/button";
import { Container } from "@ebox/ui/container";

const steps = [
  {
    id: "01",
    name: "Get Your Virtual Address",
    description:
      "Sign up for EboxSecure and receive your unique virtual address (123 Main St, UID-12345, Carmel IN) to use at any retailer checkout.",
    imageSrc: "/placeholder-image-1.jpg",
    icon: MapPin,
    color: "from-blue-500 to-blue-600",
    details: [
      "Instant virtual address generation",
      "Works with any retailer",
      "No setup fees or hidden costs",
      "24/7 account access",
    ],
  },
  {
    id: "02",
    name: "Shop Anywhere",
    description:
      "Use your virtual address at any retailer, or select EboxSecure at checkout with our Shopify app integration.",
    imageSrc: "/placeholder-image-2.jpg",
    icon: ShoppingBag,
    color: "from-green-500 to-green-600",
    details: [
      "Compatible with all major retailers",
      "Shopify app integration",
      "Amazon, eBay, and more",
      "International shipping supported",
    ],
  },
  {
    id: "03",
    name: "Secure Delivery",
    description:
      "Your packages are delivered to our secure warehouse location instead of being left unattended at your doorstep.",
    imageSrc: "/placeholder-image-3.jpg",
    icon: Truck,
    color: "from-purple-500 to-purple-600",
    details: [
      "24/7 security monitoring",
      "Climate-controlled storage",
      "All carriers accepted",
      "Real-time tracking updates",
    ],
  },
  {
    id: "04",
    name: "Pickup When Ready",
    description:
      "Receive notifications when your packages arrive and pick them up at your convenience during extended business hours.",
    imageSrc: "/placeholder-image-4.jpg",
    icon: Clock,
    color: "from-orange-500 to-orange-600",
    details: [
      "Instant arrival notifications",
      "Extended pickup hours",
      "Quick verification process",
      "Multiple pickup locations",
    ],
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const timelineProgress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

  return (
    <div className="bg-muted/50 py-24 sm:py-32" ref={containerRef}>
      <Container>
        <motion.div
          className="mx-auto max-w-2xl lg:text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-base font-semibold leading-7 text-primary">
            Simple Process
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How EboxSecure Works
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our streamlined process makes secure package delivery easy for
            businesses of all sizes.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-4xl sm:mt-20 lg:mt-24">
          {/* Animated Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 h-full w-0.5 bg-border lg:left-1/2 lg:-translate-x-px">
              <motion.div
                className="h-full w-full bg-gradient-to-b from-primary to-primary/60"
                style={{
                  scaleY: timelineProgress,
                  transformOrigin: "top",
                }}
                initial={{ scaleY: 0 }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-16">
              {steps.map((step, stepIdx) => {
                const isEven = stepIdx % 2 === 0;

                return (
                  <motion.div
                    key={step.id}
                    className={`relative flex items-center ${
                      isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: [1, 1.01, 1],
                    }}
                    transition={{
                      opacity: { duration: 0.6, delay: stepIdx * 0.1 },
                      x: { duration: 0.6, delay: stepIdx * 0.1 },
                      scale: {
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: stepIdx * 2,
                      },
                    }}
                  >
                    {/* Step Content */}
                    <div
                      className={`flex-1 pl-16 lg:pl-0 ${isEven ? "lg:pr-12" : "lg:pl-12"}`}
                    >
                      <motion.div
                        className="group relative rounded-2xl bg-background p-6 shadow-sm transition-all duration-300 hover:shadow-lg"
                        onHoverStart={() => setHoveredStep(step.id)}
                        onHoverEnd={() => setHoveredStep(null)}
                        onClick={(e) => {
                          e.preventDefault();
                          setHoveredStep(
                            hoveredStep === step.id ? null : step.id,
                          );
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          setHoveredStep(
                            hoveredStep === step.id ? null : step.id,
                          );
                        }}
                        whileHover={{ scale: 1.02 }}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Step Header */}
                        <div className="mb-4 flex items-center gap-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${step.color} text-white shadow-lg`}
                          >
                            <step.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-primary">
                              Step {step.id}
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {step.name}
                            </h3>
                          </div>
                        </div>

                        {/* Step Description */}
                        <p className="mb-4 text-muted-foreground">
                          {step.description}
                        </p>

                        {/* Interactive Hotspot */}
                        <motion.div
                          className="relative"
                          initial={false}
                          animate={{
                            height: hoveredStep === step.id ? "auto" : 0,
                            opacity: hoveredStep === step.id ? 1 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="border-t border-border pt-4">
                            <div className="mb-3 flex items-center gap-2">
                              <Info className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-foreground">
                                Key Features
                              </span>
                            </div>
                            <ul className="space-y-2">
                              {step.details.map((detail, idx) => (
                                <motion.li
                                  key={idx}
                                  className="flex items-center gap-2 text-sm text-muted-foreground"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                >
                                  <ArrowRight className="h-3 w-3 text-primary" />
                                  {detail}
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>

                        {/* Hover Indicator */}
                        <motion.div
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: hoveredStep === step.id ? 1 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Info className="h-3 w-3" />
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Step Number (Mobile) */}
                    <div className="absolute left-0 top-6 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white lg:hidden">
                      {stepIdx + 1}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            className="mt-16 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button asChild size="lg" className="group">
              <Link href="/for-customers">
                Learn More About How It Works
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Badge,
  Clock,
  MapPin,
  Package,
  Shield,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Container } from "@ebox/ui/container";

const features = [
  {
    id: 1,
    name: "Virtual Address System",
    description:
      "Get a unique virtual address for all your deliveries. Use it at any retailer checkout for secure delivery to our warehouse.",
    icon: MapPin,
    category: "core",
    size: "large",
  },
  {
    id: 2,
    name: "Shopify App Integration",
    description:
      "Seamlessly select EboxSecure locations during checkout at participating Shopify stores with auto-populated shipping fields.",
    icon: ShoppingBag,
    category: "integration",
    size: "large",
  },
  {
    id: 3,
    name: "Enhanced Security",
    description:
      "Protect your packages from theft with secure warehouse storage instead of doorstep delivery.",
    icon: Shield,
    category: "core",
    size: "small",
  },
  {
    id: 4,
    name: "Earlier Access",
    description:
      "Get your packages earlier with B2B delivery times instead of waiting for residential delivery windows.",
    icon: Clock,
    category: "benefit",
    size: "small",
  },
  {
    id: 5,
    name: "High-Volume Capacity",
    description:
      "Perfect for businesses with large order volumes. No more worrying about package pile-ups.",
    icon: Package,
    category: "benefit",
    size: "medium",
  },
  {
    id: 6,
    name: "All Carrier Compatibility",
    description:
      "Works with all major carriers including UPS, FedEx, USPS, DHL, and more.",
    icon: Truck,
    category: "integration",
    size: "medium",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const iconVariants = {
    hidden: {
      scale: 0,
      rotate: -180,
    },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        delay: index * 0.1 + 0.3,
        ease: "backOut",
      },
    },
    hover: {
      scale: 1.2,
      rotate: 360,
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };

  // Determine card size classes based on feature size
  const sizeClasses: Record<string, string> = {
    small:
      "col-span-1 row-span-1 md:col-span-2 md:row-span-1 lg:col-span-2 lg:row-span-1",
    medium:
      "col-span-1 row-span-1 md:col-span-2 md:row-span-1 lg:col-span-3 lg:row-span-1",
    large:
      "col-span-1 row-span-1 md:col-span-2 md:row-span-1 lg:col-span-5 lg:row-span-1",
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover={{
        y: -8,
        rotateX: 5,
        rotateY: 5,
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
      className={`${sizeClasses[feature.size]} group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10`}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {/* Background gradient that appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {(feature.id === 1 || feature.id === 2) && (
          <div className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary ring-2 ring-primary/30">
            {feature.id}
          </div>
        )}
        <div className="flex items-start gap-4">
          <motion.div
            variants={iconVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            whileHover="hover"
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20"
          >
            <feature.icon className="h-6 w-6" />
          </motion.div>

          <div className="flex-1">
            <motion.h3
              className="text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
            >
              {feature.name}
            </motion.h3>
          </div>
        </div>

        <motion.p
          className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
        >
          {feature.description}
        </motion.p>

        {/* Category badge */}
        <motion.div
          className="mt-4 self-start"
          initial={{ opacity: 0, scale: 0 }}
          animate={
            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
          }
          transition={{ delay: index * 0.1 + 0.6, duration: 0.4 }}
        >
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {feature.category}
          </span>
        </motion.div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <div className="relative overflow-hidden bg-background py-24 sm:py-32">
      <Container>
        <motion.div
          ref={sectionRef}
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-2xl lg:text-center"
        >
          <motion.h2
            className="text-base font-semibold leading-7 text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Delivery Solutions
          </motion.h2>
          <motion.p
            className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Two Ways to Use EboxSecure
          </motion.p>
          <motion.p
            className="mt-6 text-lg leading-8 text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Whether you're shopping at a Shopify store or any other online
            retailer, EboxSecure provides flexible solutions for secure package
            delivery.
          </motion.p>
        </motion.div>

        {/* Masonry/Bento Box Grid */}
        <div className="relative mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-10">
            {features.map((feature, index) => (
              <FeatureCard key={feature.id} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

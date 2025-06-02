"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  Award,
  CheckCircle,
  Package,
  Quote,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { Container } from "@ebox/ui/container";

// Animated Counter Component
const AnimatedCounter = ({
  end,
  duration = 2,
  suffix = "",
  prefix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(countRef, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, end, duration]);

  return (
    <span ref={countRef}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// Trust Badge Component
const TrustBadge = ({
  icon: Icon,
  label,
  delay = 0,
}: {
  icon: any;
  label: string;
  delay?: number;
}) => (
  <motion.div
    className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800"
    initial={{ scale: 0, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 1 }}
    viewport={{ once: true }}
    transition={{
      delay,
      duration: 0.5,
      type: "spring",
      stiffness: 200,
      boxShadow: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
    animate={{
      boxShadow: [
        "0 0 0 0 rgba(34, 197, 94, 0.4)",
        "0 0 0 10px rgba(34, 197, 94, 0)",
        "0 0 0 0 rgba(34, 197, 94, 0.4)",
      ],
    }}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </motion.div>
);

// Real-time Activity Item
const ActivityItem = ({
  activity,
  delay = 0,
}: {
  activity: {
    id: string;
    type: "delivery" | "pickup" | "signup";
    location: string;
    time: string;
    package?: string;
  };
  delay?: number;
}) => {
  const getIcon = () => {
    switch (activity.type) {
      case "delivery":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "pickup":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "signup":
        return <Users className="h-4 w-4 text-purple-600" />;
    }
  };

  const getMessage = () => {
    switch (activity.type) {
      case "delivery":
        return `Package delivered to ${activity.location}`;
      case "pickup":
        return `Package picked up from ${activity.location}`;
      case "signup":
        return `New business signed up in ${activity.location}`;
    }
  };

  return (
    <motion.div
      className="flex items-center gap-3 rounded-lg bg-white/80 p-3 shadow-sm"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-gray-900">{getMessage()}</p>
        <p className="text-xs text-gray-500">{activity.time}</p>
      </div>
    </motion.div>
  );
};

const stats = [
  {
    id: 1,
    name: "Packages Delivered",
    value: 15420,
    suffix: "+",
    icon: Package,
    color: "text-blue-600",
    trending: 15,
  },
  {
    id: 2,
    name: "Active Businesses",
    value: 847,
    suffix: "+",
    icon: Users,
    color: "text-green-600",
    trending: 12,
  },
  {
    id: 3,
    name: "Secure Locations",
    value: 12,
    suffix: "",
    icon: ShieldCheck,
    color: "text-purple-600",
    trending: 8,
  },
  {
    id: 4,
    name: "Customer Satisfaction",
    value: 99,
    suffix: "%",
    icon: Star,
    color: "text-orange-600",
    trending: 5,
  },
];

const testimonials = [
  {
    id: 1,
    content:
      "EboxSecure has completely transformed how we handle package deliveries. No more missed deliveries or stolen packages!",
    author: "Sarah Johnson",
    role: "Operations Manager",
    company: "TechStart Inc.",
    rating: 5,
  },
  {
    id: 2,
    content:
      "The peace of mind knowing our packages are secure is invaluable. The pickup process is so convenient and efficient.",
    author: "Michael Chen",
    role: "Small Business Owner",
    company: "Chen's Electronics",
    rating: 5,
  },
  {
    id: 3,
    content:
      "We've saved countless hours and eliminated package theft completely. EboxSecure is a game-changer for our business.",
    author: "Emily Rodriguez",
    role: "Store Manager",
    company: "Boutique Fashion Co.",
    rating: 5,
  },
];

const trustBadges = [
  { icon: Award, label: "Best in Class Security" },
  { icon: CheckCircle, label: "99.9% Uptime" },
  { icon: Zap, label: "Lightning Fast" },
];

// Mock real-time activities
const generateActivity = () => {
  const types: Array<"delivery" | "pickup" | "signup"> = [
    "delivery",
    "pickup",
    "signup",
  ];
  const locations = [
    "Downtown Carmel",
    "Arts District",
    "City Center",
    "Midtown",
    "West Side",
  ];
  const packages = [
    "Electronics",
    "Documents",
    "Clothing",
    "Books",
    "Supplies",
  ];

  const now = Date.now();
  const typeIndex = now % types.length;
  const locationIndex = Math.floor(now / 1000) % locations.length;
  const packageIndex = Math.floor(now / 10000) % packages.length;

  return {
    id: now.toString(36),
    type: types[typeIndex] as "delivery" | "pickup" | "signup",
    location: locations[locationIndex] as string,
    time: "Just now",
    package: packages[packageIndex] as string,
  };
};

export function TrustSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activities, setActivities] = useState([
    generateActivity(),
    generateActivity(),
    generateActivity(),
  ]);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update activities
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities((prev) => {
        const newActivity = generateActivity();
        return [newActivity, ...prev.slice(0, 2)];
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trusted by Businesses in Carmel, Indiana
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              EboxSecure provides reliable package delivery solutions for
              businesses of all sizes.
            </p>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {trustBadges.map((badge, idx) => (
              <TrustBadge
                key={idx}
                icon={badge.icon}
                label={badge.label}
                delay={idx * 0.1}
              />
            ))}
          </motion.div>

          {/* Animated Statistics */}
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.id}
                className="relative flex flex-col overflow-hidden bg-background p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Background Animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: "easeInOut",
                  }}
                />

                <dt className="relative z-10 text-sm font-semibold leading-6 text-muted-foreground">
                  {stat.name}
                </dt>
                <dd className="relative z-10 order-first text-3xl font-semibold tracking-tight text-foreground">
                  <motion.div
                    className="flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </motion.div>
                    <span>
                      <AnimatedCounter
                        end={stat.value}
                        suffix={stat.suffix}
                        duration={2 + idx * 0.2}
                      />
                    </span>
                  </motion.div>
                </dd>

                {/* Trending Indicator */}
                <motion.div
                  className="absolute right-2 top-2 flex items-center gap-1 text-xs text-green-600"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 + 1 }}
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>+{stat.trending}%</span>
                </motion.div>
              </motion.div>
            ))}
          </dl>

          {/* Testimonials and Activity Feed */}
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Rotating Testimonials */}
            <motion.div
              className="rounded-2xl bg-background p-8 shadow-sm"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 flex items-center gap-2">
                <Quote className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Customer Stories
                </h3>
              </div>

              <div className="relative h-48">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    {testimonials[currentTestimonial] && (
                      <>
                        <blockquote className="mb-4 text-muted-foreground">
                          "{testimonials[currentTestimonial].content}"
                        </blockquote>

                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="font-semibold text-foreground">
                              {testimonials[currentTestimonial].author}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {testimonials[currentTestimonial].role} at{" "}
                              {testimonials[currentTestimonial].company}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {[
                              ...Array(testimonials[currentTestimonial].rating),
                            ].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Testimonial Indicators */}
              <div className="mt-4 flex justify-center gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      idx === currentTestimonial ? "bg-primary" : "bg-muted"
                    }`}
                    onClick={() => setCurrentTestimonial(idx)}
                  />
                ))}
              </div>
            </motion.div>

            {/* Real-time Activity Feed */}
            <motion.div
              className="rounded-2xl bg-background p-8 shadow-sm"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground">
                  Live Activity
                </h3>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {activities.map((activity, idx) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      delay={idx * 0.1}
                    />
                  ))}
                </AnimatePresence>
              </div>

              <motion.div
                className="mt-4 text-center text-sm text-muted-foreground"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Updates every few seconds
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Container>
    </div>
  );
}

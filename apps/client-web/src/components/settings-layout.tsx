"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CreditCard, Crown, Settings, Trash2, Users } from "lucide-react";

import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import { Card, CardContent } from "@ebox/ui/card";
import { Separator } from "@ebox/ui/separator";

const settingsNavItems = [
  {
    href: "/settings",
    label: "General",
    icon: Settings,
    description: "Account & Profile",
  },
  {
    href: "/settings/notifications",
    label: "Notifications",
    icon: Bell,
    description: "Alerts & Updates",
  },
  {
    href: "/settings/trusted-contacts",
    label: "Trusted Contacts",
    icon: Users,
    description: "Emergency Contacts",
  },
  {
    href: "/settings/billing",
    label: "Billing",
    icon: CreditCard,
    description: "Payment & Invoices",
  },
  {
    href: "/settings/subscription",
    label: "Subscription",
    icon: Crown,
    description: "Plan & Features",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function SettingsLayout({
  children,
  title,
  description,
}: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {settingsNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    const IconComponent = item.icon;

                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={`flex items-start gap-3 rounded-lg px-3 py-3 transition-all hover:bg-accent ${
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <IconComponent className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          {isActive && (
                            <Badge variant="secondary" className="ml-auto">
                              Active
                            </Badge>
                          )}
                        </div>
                      </Link>
                    );
                  })}

                  <Separator className="my-2" />

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

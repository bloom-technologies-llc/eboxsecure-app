"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { downgradeSubscription } from "@/actions/downgrade-subscription";
import { Plan } from "@/types/subscription";
import { AlertTriangle, Calendar, ChevronDown } from "lucide-react";

import { Button } from "@ebox/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ebox/ui/dialog";

interface DowngradeConfirmationDialogProps {
  targetPlan: {
    name: string;
    price: string;
    lookupKey: Plan;
  };
  currentPlan: {
    name: string;
    price: string;
  };
  currentPeriodEnd: number;
  children: React.ReactNode;
}

export function DowngradeConfirmationDialog({
  targetPlan,
  currentPlan,
  currentPeriodEnd,
  children,
}: DowngradeConfirmationDialogProps) {
  const router = useRouter();
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDowngrade = async () => {
    setIsDowngrading(true);
    try {
      const result = await downgradeSubscription(targetPlan.lookupKey);

      // For downgrades, result should be an object with success info
      if (typeof result === "object" && result.type === "downgrade_scheduled") {
        setIsOpen(false);
        router.refresh();
      } else {
        throw new Error("Unexpected response from downgrade action");
      }
    } catch (error) {
      console.error("Downgrade failed:", error);
    } finally {
      setIsDowngrading(false);
    }
  };

  const nextBillingDate = new Date(
    currentPeriodEnd * 1000,
  ).toLocaleDateString();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChevronDown className="h-5 w-5 text-blue-600" />
            Confirm Downgrade
          </DialogTitle>
          <DialogDescription>
            You're about to downgrade from {currentPlan.name} to{" "}
            {targetPlan.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground">
                {currentPlan.name}
              </p>
              <p className="text-lg font-bold">{currentPlan.price}</p>
            </div>
            <div className="flex items-center">
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">New Plan</p>
              <p className="text-sm text-muted-foreground">{targetPlan.name}</p>
              <p className="text-lg font-bold">{targetPlan.price}</p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 text-blue-600" />
              <div className="text-blue-800">
                <p className="font-medium">Downgrade Details</p>
                <ul className="mt-1 space-y-1 text-sm">
                  <li>
                    • Your current plan will remain active until{" "}
                    {nextBillingDate}
                  </li>
                  <li>
                    • The downgrade will take effect on your next billing cycle
                  </li>
                  <li>
                    • You'll continue to have access to all current features
                    until then
                  </li>
                  <li>
                    • You can cancel this downgrade anytime before{" "}
                    {nextBillingDate}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600" />
              <div className="text-yellow-800">
                <p className="font-medium">Important</p>
                <p className="mt-1 text-sm">
                  Some features available in your current plan may be limited or
                  unavailable in the {targetPlan.name} plan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDowngrading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDowngrade}
            disabled={isDowngrading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isDowngrading ? "Scheduling..." : "Confirm Downgrade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

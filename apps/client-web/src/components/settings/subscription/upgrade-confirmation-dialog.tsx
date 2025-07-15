"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upgradeSubscription } from "@/actions/upgrade-subscription";
import { Plan } from "@/types/subscription";
import { ChevronUp, CreditCard } from "lucide-react";

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

interface UpgradeConfirmationDialogProps {
  targetPlan: {
    name: string;
    price: string;
    lookupKey: Plan;
  };
  currentPlan: {
    name: string;
    price: string;
  };
  children: React.ReactNode;
}

export function UpgradeConfirmationDialog({
  targetPlan,
  currentPlan,
  children,
}: UpgradeConfirmationDialogProps) {
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const result = await upgradeSubscription(targetPlan.lookupKey);

      if (result && result.type === "upgrade_completed") {
        setIsOpen(false);
        router.refresh();
      } else {
        throw new Error("Unexpected response from upgrade action");
      }
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChevronUp className="h-5 w-5 text-green-600" />
            Confirm Upgrade
          </DialogTitle>
          <DialogDescription>
            You're about to upgrade from {currentPlan.name} to {targetPlan.name}
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
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">New Plan</p>
              <p className="text-sm text-muted-foreground">{targetPlan.name}</p>
              <p className="text-lg font-bold">{targetPlan.price}</p>
            </div>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-2">
              <CreditCard className="mt-0.5 h-4 w-4 text-green-600" />
              <div className="text-green-800">
                <p className="font-medium">Upgrade Details</p>
                <ul className="mt-1 space-y-1 text-sm">
                  <li>• Your upgrade will take effect immediately</li>
                  <li>
                    • You'll be charged a prorated amount for the remaining
                    billing period
                  </li>
                  <li>
                    • Your next billing cycle will be at the new plan rate
                  </li>
                  <li>• You'll have immediate access to all new features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUpgrading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isUpgrading ? "Processing..." : "Confirm Upgrade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { SubscriptionType } from "@prisma/client";
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

interface CancelDowngradeDialogProps {
  currentPlan: {
    name: string;
    price: string;
  };
  downgradedPlan: {
    plan: SubscriptionType;
    price: number;
  };
  children: React.ReactNode;
}

export function CancelDowngradeDialog({
  currentPlan,
  downgradedPlan,
  children,
}: CancelDowngradeDialogProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const { mutate: cancelDowngrade, isPending } =
    api.subscription.cancelDowngrade.useMutation({
      onSuccess: () => {
        setIsOpen(false);
        router.refresh();
      },
    });

  const handleCancelDowngrade = async () => {
    cancelDowngrade();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChevronDown className="h-5 w-5 text-blue-600" />
            Cancel Downgrade
          </DialogTitle>
          <DialogDescription>
            You're about to cancel the downgrade from {currentPlan.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 text-blue-600" />
              <div className="text-blue-800">
                <p className="font-medium">Cancellation Details</p>
                <ul className="mt-1 space-y-1 text-sm">
                  <li>• Your current plan will remain active</li>
                  <li>
                    • Cancelling the downgrade will take effect immediately
                  </li>
                  <li>• You have not been charged for the downgrade</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCancelDowngrade}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "Scheduling..." : "Cancel Downgrade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { AlertTriangle } from "lucide-react";

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

interface ChangeBillingPeriodDialogProps {
  currentBillingPeriod: "month" | "year";
  currentBillingPeriodEnd: number;
}

export function ChangeBillingPeriodDialog({
  currentBillingPeriod,
  currentBillingPeriodEnd,
}: ChangeBillingPeriodDialogProps) {
  const otherBillingPeriod =
    currentBillingPeriod === "month" ? "year" : "month";
  const router = useRouter();
  const { mutate: changeBillingPeriod, isPending } =
    api.subscription.changeBillingPeriod.useMutation({
      onSuccess: () => {
        setIsOpen(false);
        router.refresh();
      },
    });
  const [isOpen, setIsOpen] = useState(false);

  const handleChangeBillingPeriod = () => {
    changeBillingPeriod({
      billingPeriod: otherBillingPeriod,
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="primary">Change Billing Period</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Change Billing Period
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to change your billing period from{" "}
            {currentBillingPeriod} to {otherBillingPeriod}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-medium">
              What happens when you change your billing period:
            </h4>
            <ul className="space-y-1 text-sm">
              <li>
                • Your subscription&apos;s billing period will remain the same
                until the end of the current billing period on{" "}
                {new Date(currentBillingPeriodEnd * 1000).toLocaleDateString()}
              </li>
              <li>• Your subscription will renew on the new billing period</li>
              <li>• No further charges will be made</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Keep Billing Period
          </Button>
          <Button
            variant="destructive"
            onClick={handleChangeBillingPeriod}
            disabled={isPending}
          >
            {isPending ? "Changing..." : "Change Billing Period"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

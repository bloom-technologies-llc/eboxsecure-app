"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelSubscription } from "@/actions";
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

interface CancelSubscriptionDialogProps {
  currentPlanName: string;
  currentPeriodEnd: number;
}

export function CancelSubscriptionDialog({
  currentPlanName,
  currentPeriodEnd,
}: CancelSubscriptionDialogProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();

      setIsOpen(false);

      router.refresh();
    } catch (error) {
      console.error("Cancellation failed:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Cancel Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancel Subscription
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your {currentPlanName} subscription?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-medium">What happens when you cancel:</h4>
            <ul className="space-y-1 text-sm">
              <li>
                • Your subscription will remain active until{" "}
                {new Date(currentPeriodEnd * 1000).toLocaleDateString()}
              </li>
              <li>
                • You'll continue to have access to all features until then
              </li>
              <li>• No further charges will be made</li>
              <li>• You can reactivate anytime before the end date</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isCancelling}
          >
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Cancel Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

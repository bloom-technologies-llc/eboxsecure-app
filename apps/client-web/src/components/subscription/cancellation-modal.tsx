"use client";

import { useState } from "react";
import { cancelSubscription } from "@/lib/subscription-actions";
import { AlertTriangle } from "lucide-react";

import { Button } from "@ebox/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ebox/ui/dialog";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPlanName: string;
  currentPeriodEnd: number;
}

export function CancellationModal({
  isOpen,
  onClose,
  onSuccess,
  currentPlanName,
  currentPeriodEnd,
}: CancellationModalProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Cancellation failed:", error);
      // Handle error - you might want to show a toast notification here
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose} disabled={isCancelling}>
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

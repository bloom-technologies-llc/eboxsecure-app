"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { CheckCircle, RotateCcw } from "lucide-react";

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

export default function ReactivateButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { mutate: reactivateSubscription, isPending } =
    api.subscription.reactivateSubscription.useMutation({
      onSuccess: () => {
        setIsOpen(false);
        router.refresh();
      },
    });

  const handleReactivate = async () => {
    reactivateSubscription();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Reactivate</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-green-600" />
            Reactivate Subscription
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to reactivate your subscription?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-medium">
              What happens when you reactivate:
            </h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Your subscription will be restored immediately
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                You'll regain access to all premium features
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Billing will resume on your normal schedule
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                No data or settings will be lost
              </li>
            </ul>
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
            onClick={handleReactivate}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending ? "Reactivating..." : "Confirm Reactivation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

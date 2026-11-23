"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Trash2 } from "lucide-react";

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
import { useToast } from "@ebox/ui/hooks/use-toast";

/**
 * Lets a customer ask for their account to be deleted. The request is emailed
 * to EboxSecure and fulfilled by hand.
 */
export default function DeleteAccountRequest() {
  const [isOpen, setIsOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const { toast } = useToast();
  const { mutate: requestDeletion, isPending } =
    api.user.requestAccountDeletion.useMutation({
      onSuccess: () => {
        setRequested(true);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Request not sent",
          description: error.message,
        });
      },
    });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setRequested(false);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        {requested ? (
          <>
            <DialogHeader>
              <DialogTitle>Deletion request sent</DialogTitle>
              <DialogDescription>
                We have received your request to delete your account. Our team
                will email you to confirm once it has been deleted. Your account
                stays active until then.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setIsOpen(false)}>Close</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request account deletion</DialogTitle>
              <DialogDescription>
                This sends a request to EboxSecure to permanently delete your
                account, cancel your subscription and remove your personal data.
                Please pick up any packages we are holding for you first. This
                cannot be undone once it is completed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Keep My Account
              </Button>
              <Button
                variant="destructive"
                onClick={() => requestDeletion()}
                disabled={isPending}
              >
                {isPending ? "Sending..." : "Request Deletion"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

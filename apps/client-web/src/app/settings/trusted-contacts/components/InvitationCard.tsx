"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Check, User, X } from "lucide-react";

import { Button } from "@ebox/ui/button";

interface PendingInvitation {
  id: string;
  accountHolderId: string;
  accountHolder: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

interface InvitationCardProps {
  invitation: PendingInvitation;
}

export default function InvitationCard({ invitation }: InvitationCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const utils = api.useUtils();

  const acceptInvitation = api.trustedContacts.acceptInvitation.useMutation({
    onSuccess: () => {
      utils.trustedContacts.getMyTrustedContacts.invalidate();
      utils.trustedContacts.getPendingInvitations.invalidate();
      setIsAccepting(false);
    },
    onError: (error) => {
      console.error("Failed to accept invitation:", error);
      setIsAccepting(false);
    },
  });

  const declineInvitation = api.trustedContacts.declineInvitation.useMutation({
    onSuccess: () => {
      utils.trustedContacts.getPendingInvitations.invalidate();
      setIsDeclining(false);
    },
    onError: (error) => {
      console.error("Failed to decline invitation:", error);
      setIsDeclining(false);
    },
  });

  const handleAccept = () => {
    setIsAccepting(true);
    acceptInvitation.mutate({
      trustedContactId: invitation.accountHolderId,
    });
  };

  const handleDecline = () => {
    setIsDeclining(true);
    declineInvitation.mutate({
      trustedContactId: invitation.accountHolderId,
    });
  };

  const displayName =
    invitation.accountHolder.firstName && invitation.accountHolder.lastName
      ? `${invitation.accountHolder.firstName} ${invitation.accountHolder.lastName}`
      : invitation.accountHolder.email;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-blue-900">{displayName}</p>
            <p className="text-sm text-blue-700">
              {invitation.accountHolder.email}
            </p>
            <p className="text-xs text-blue-600">
              Wants to add you as a trusted contact
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={handleDecline}
            disabled={isAccepting || isDeclining}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
            {isDeclining ? "..." : "Decline"}
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={isAccepting || isDeclining}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Check className="h-4 w-4" />
            {isAccepting ? "..." : "Accept"}
          </Button>
        </div>
      </div>

      <div className="mt-3 rounded-md bg-blue-100 p-3">
        <p className="text-sm text-blue-800">
          <strong>If you accept:</strong> You'll be able to view their orders
          and generate pickup QR codes on their behalf. You can remove yourself
          from this arrangement at any time.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Clock, User, X } from "lucide-react";

import { Button } from "@ebox/ui/button";

interface SentPendingInvitation {
  id: string;
  trustedContactId: string;
  trustedContact: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

interface SentInvitationCardProps {
  invitation: SentPendingInvitation;
}

export default function SentInvitationCard({
  invitation,
}: SentInvitationCardProps) {
  const [isCanceling, setIsCanceling] = useState(false);

  const utils = api.useUtils();

  const cancelInvitation = api.trustedContacts.removeTrustedContact.useMutation(
    {
      onSuccess: () => {
        utils.trustedContacts.getSentPendingInvitations.invalidate();
        utils.trustedContacts.getMyTrustedContacts.invalidate();
        setIsCanceling(false);
      },
      onError: (error) => {
        console.error("Failed to cancel invitation:", error);
        setIsCanceling(false);
      },
    },
  );

  const handleCancel = () => {
    setIsCanceling(true);
    cancelInvitation.mutate({
      trustedContactId: invitation.trustedContactId,
    });
  };

  const displayName =
    invitation.trustedContact.firstName && invitation.trustedContact.lastName
      ? `${invitation.trustedContact.firstName} ${invitation.trustedContact.lastName}`
      : invitation.trustedContact.email;

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-orange-900">{displayName}</p>
            <p className="text-sm text-orange-700">
              {invitation.trustedContact.email}
            </p>
            <p className="text-xs text-orange-600">Invitation pending</p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleCancel}
          disabled={isCanceling}
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
          {isCanceling ? "..." : "Cancel"}
        </Button>
      </div>

      <div className="mt-3 rounded-md bg-orange-100 p-3">
        <p className="text-sm text-orange-800">
          <strong>Waiting for response:</strong> This person hasn't responded to
          your invitation yet. They'll be able to view your orders and pick up
          packages once they accept.
        </p>
      </div>
    </div>
  );
}

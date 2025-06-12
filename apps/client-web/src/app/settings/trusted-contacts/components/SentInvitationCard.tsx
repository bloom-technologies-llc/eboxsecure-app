"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Clock, User, X } from "lucide-react";

import { Button } from "@ebox/ui/button";

interface SentPendingInvitation {
  id: string;
  trustedContactId: string | null;
  trustedContact: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  isPendingSignup?: boolean;
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
    if (invitation.trustedContactId) {
      setIsCanceling(true);
      cancelInvitation.mutate({
        trustedContactId: invitation.trustedContactId,
      });
    }
  };

  const displayName =
    invitation.trustedContact.firstName && invitation.trustedContact.lastName
      ? `${invitation.trustedContact.firstName} ${invitation.trustedContact.lastName}`
      : invitation.trustedContact.email;

  const isPendingSignup = invitation.isPendingSignup;

  return (
    <div
      className={`rounded-lg border p-4 ${isPendingSignup ? "border-blue-200 bg-blue-50" : "border-orange-200 bg-orange-50"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${isPendingSignup ? "bg-blue-100" : "bg-orange-100"}`}
          >
            {isPendingSignup ? (
              <User
                className={`h-5 w-5 ${isPendingSignup ? "text-blue-600" : "text-orange-600"}`}
              />
            ) : (
              <Clock
                className={`h-5 w-5 ${isPendingSignup ? "text-blue-600" : "text-orange-600"}`}
              />
            )}
          </div>
          <div>
            <p
              className={`font-medium ${isPendingSignup ? "text-blue-900" : "text-orange-900"}`}
            >
              {displayName}
            </p>
            <p
              className={`text-sm ${isPendingSignup ? "text-blue-700" : "text-orange-700"}`}
            >
              {invitation.trustedContact.email}
            </p>
            <p
              className={`text-xs ${isPendingSignup ? "text-blue-600" : "text-orange-600"}`}
            >
              {isPendingSignup ? "Waiting for sign-up" : "Invitation pending"}
            </p>
          </div>
        </div>

        {invitation.trustedContactId && (
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
        )}
      </div>

      <div
        className={`mt-3 rounded-md p-3 ${isPendingSignup ? "bg-blue-100" : "bg-orange-100"}`}
      >
        <p
          className={`text-sm ${isPendingSignup ? "text-blue-800" : "text-orange-800"}`}
        >
          {isPendingSignup ? (
            <>
              <strong>Waiting for sign-up:</strong> This person needs to create
              an account first. They'll be able to view your orders and pick up
              packages once they sign up and accept your invitation.
            </>
          ) : (
            <>
              <strong>Waiting for response:</strong> This person hasn't
              responded to your invitation yet. They'll be able to view your
              orders and pick up packages once they accept.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

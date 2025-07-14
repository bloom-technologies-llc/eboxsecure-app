"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Trash2, User } from "lucide-react";

import { Button } from "@ebox/ui/button";

interface GrantedContact {
  id: string;
  accountHolderId: string;
  trustedContactId: string;
  status: string;
  trustedContact: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

interface ReceivedContact {
  id: string;
  accountHolderId: string;
  trustedContactId: string;
  status: string;
  accountHolder: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

interface TrustedContactCardProps {
  contact: GrantedContact | ReceivedContact;
  type: "granted" | "received";
}

export default function TrustedContactCard({
  contact,
  type,
}: TrustedContactCardProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const utils = api.useUtils();
  const removeTrustedContact =
    api.trustedContacts.removeTrustedContact.useMutation({
      onSuccess: () => {
        utils.trustedContacts.getMyTrustedContacts.invalidate();
        setShowConfirmDialog(false);
        setIsRemoving(false);
      },
      onError: (error) => {
        console.error("Failed to remove trusted contact:", error);
        setIsRemoving(false);
      },
    });

  const handleRemove = () => {
    setIsRemoving(true);
    removeTrustedContact.mutate({
      trustedContactId: contact.trustedContactId,
    });
  };

  // Get display information based on type
  const displayInfo =
    type === "granted"
      ? (contact as GrantedContact).trustedContact
      : (contact as ReceivedContact).accountHolder;

  const displayName =
    displayInfo.firstName && displayInfo.lastName
      ? `${displayInfo.firstName} ${displayInfo.lastName}`
      : displayInfo.email;

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-gray-500">{displayInfo.email}</p>
            {type === "received" && (
              <p className="text-xs text-blue-600">
                You can access their orders
              </p>
            )}
          </div>
        </div>

        {type === "granted" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmDialog(true)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">
              Remove Trusted Contact
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to remove <strong>{displayName}</strong> as
              a trusted contact? They will no longer be able to view your orders
              or pick up packages you shared with them.
            </p>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isRemoving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemove}
                disabled={isRemoving}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isRemoving ? "Removing..." : "Remove"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

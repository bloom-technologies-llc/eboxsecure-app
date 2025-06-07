"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { X } from "lucide-react";

import { Button } from "@ebox/ui/button";
import { Input } from "@ebox/ui/input";
import { Label } from "@ebox/ui/label";

interface AddTrustedContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddTrustedContactModal({
  open,
  onClose,
}: AddTrustedContactModalProps) {
  const [email, setEmail] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = api.useUtils();
  const sendInvitation = api.trustedContacts.sendInvitation.useMutation({
    onSuccess: () => {
      utils.trustedContacts.getMyTrustedContacts.invalidate();
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to send invitation:", error);
      setIsSubmitting(false);
    },
  });

  const handleClose = () => {
    setEmail("");
    setShowConfirmation(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleNext = () => {
    if (email && email.includes("@")) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    setIsSubmitting(true);
    sendInvitation.mutate({ email });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {showConfirmation ? "Confirm Invitation" : "Add Trusted Contact"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!showConfirmation ? (
          <>
            <div className="mb-4">
              <p className="mb-4 text-sm text-gray-600">
                Add someone who can view your orders and pick up packages on
                your behalf.
              </p>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={!email || !email.includes("@")}
                className="bg-[#00698F] hover:bg-[#005A7A]"
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="mb-2 font-medium text-yellow-800">
                  Important Notice
                </h3>
                <p className="text-sm text-yellow-700">
                  By adding <strong>{email}</strong> as a trusted contact, they
                  will be able to:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-yellow-700">
                  <li>View all details of your orders</li>
                  <li>Generate QR codes to pick up your packages</li>
                  <li>Access this information until you remove them</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                They will receive a notification to accept this invitation.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="bg-[#00698F] hover:bg-[#005A7A]"
              >
                {isSubmitting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </>
        )}

        {sendInvitation.error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">
              {sendInvitation.error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

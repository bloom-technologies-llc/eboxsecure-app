import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

import { api } from "../../trpc/react";
import { DoubleCheckIcon, UserIcon } from "../icons";
import { Button } from "../ui/Button";

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
      Alert.alert("Error", "Failed to accept invitation");
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
      Alert.alert("Error", "Failed to decline invitation");
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
    <View className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <UserIcon />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-blue-900">{displayName}</Text>
            <Text className="text-sm text-blue-700">
              {invitation.accountHolder.email}
            </Text>
            <Text className="text-xs text-blue-600">
              Wants to add you as a trusted contact
            </Text>
          </View>
        </View>

        <View className="flex-row space-x-2">
          <Button
            onPress={handleDecline}
            disabled={isAccepting || isDeclining}
            variant="outline"
            size="sm"
          >
            {isDeclining ? "..." : "Decline"}
          </Button>
          <Button
            onPress={handleAccept}
            disabled={isAccepting || isDeclining}
            variant="default"
            size="sm"
          >
            {isAccepting ? "..." : "Accept"}
          </Button>
        </View>
      </View>

      <View className="mt-3 rounded-md bg-blue-100 p-3">
        <Text className="text-sm text-blue-800">
          <Text className="font-semibold">If you accept:</Text> You'll be able
          to view their orders and generate pickup QR codes on their behalf. You
          can remove yourself from this arrangement at any time.
        </Text>
      </View>
    </View>
  );
}

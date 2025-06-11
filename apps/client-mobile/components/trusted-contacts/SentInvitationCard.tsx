import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

import { api } from "../../trpc/react";
import { UserIcon } from "../icons";
import { Button } from "../ui/Button";

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
        Alert.alert("Error", "Failed to cancel invitation");
        setIsCanceling(false);
      },
    },
  );

  const handleCancel = () => {
    const displayName =
      invitation.trustedContact.firstName && invitation.trustedContact.lastName
        ? `${invitation.trustedContact.firstName} ${invitation.trustedContact.lastName}`
        : invitation.trustedContact.email;

    Alert.alert(
      "Cancel Invitation",
      `Are you sure you want to cancel the invitation for ${displayName}?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            setIsCanceling(true);
            cancelInvitation.mutate({
              trustedContactId: invitation.trustedContactId,
            });
          },
        },
      ],
    );
  };

  const displayName =
    invitation.trustedContact.firstName && invitation.trustedContact.lastName
      ? `${invitation.trustedContact.firstName} ${invitation.trustedContact.lastName}`
      : invitation.trustedContact.email;

  return (
    <View className="mb-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <UserIcon />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-orange-900">{displayName}</Text>
            <Text className="text-sm text-orange-700">
              {invitation.trustedContact.email}
            </Text>
            <Text className="text-xs text-orange-600">Invitation pending</Text>
          </View>
        </View>

        <Button
          onPress={handleCancel}
          disabled={isCanceling}
          variant="outline"
          size="sm"
        >
          {isCanceling ? "..." : "Cancel"}
        </Button>
      </View>

      <View className="mt-3 rounded-md bg-orange-100 p-3">
        <Text className="text-sm text-orange-800">
          <Text className="font-semibold">Waiting for response:</Text> This
          person hasn't responded to your invitation yet. They'll be able to
          view your orders and pick up packages once they accept.
        </Text>
      </View>
    </View>
  );
}

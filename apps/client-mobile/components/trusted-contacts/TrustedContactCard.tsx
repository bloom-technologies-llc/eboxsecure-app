import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { api } from "../../trpc/react";
import { UserIcon } from "../icons";
import { Button } from "../ui/Button";

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
  const [isRemoving, setIsRemoving] = useState(false);

  const utils = api.useUtils();
  const removeTrustedContact =
    api.trustedContacts.removeTrustedContact.useMutation({
      onSuccess: () => {
        utils.trustedContacts.getMyTrustedContacts.invalidate();
        setIsRemoving(false);
      },
      onError: (error) => {
        console.error("Failed to remove trusted contact:", error);
        Alert.alert("Error", "Failed to remove trusted contact");
        setIsRemoving(false);
      },
    });

  const handleRemove = () => {
    const displayInfo =
      type === "granted"
        ? (contact as GrantedContact).trustedContact
        : (contact as ReceivedContact).accountHolder;

    const displayName =
      displayInfo.firstName && displayInfo.lastName
        ? `${displayInfo.firstName} ${displayInfo.lastName}`
        : displayInfo.email;

    Alert.alert(
      "Remove Trusted Contact",
      `Are you sure you want to remove ${displayName} as a trusted contact? They will no longer be able to view your orders or pick up packages.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setIsRemoving(true);
            removeTrustedContact.mutate({
              trustedContactId: contact.trustedContactId,
            });
          },
        },
      ],
    );
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
    <View className="mb-3 flex-row items-center justify-between rounded-lg border border-gray-200 p-4">
      <View className="flex-1 flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <UserIcon />
        </View>
        <View className="flex-1">
          <Text className="font-medium">{displayName}</Text>
          <Text className="text-sm text-gray-500">{displayInfo.email}</Text>
          {type === "received" && (
            <Text className="text-xs text-blue-600">
              You can access their orders
            </Text>
          )}
        </View>
      </View>

      {type === "granted" && (
        <Button
          onPress={handleRemove}
          disabled={isRemoving}
          variant="destructive"
          size="sm"
        >
          {isRemoving ? "Removing..." : "Remove"}
        </Button>
      )}
    </View>
  );
}

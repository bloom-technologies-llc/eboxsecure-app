import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

import { api } from "../../trpc/react";
import { Button } from "../ui/Button";

interface AddTrustedContactModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddTrustedContactModal({
  visible,
  onClose,
}: AddTrustedContactModalProps) {
  const [email, setEmail] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = api.useUtils();
  const sendInvitation = api.trustedContacts.sendInvitation.useMutation({
    onSuccess: () => {
      utils.trustedContacts.getMyTrustedContacts.invalidate();
      utils.trustedContacts.getSentPendingInvitations.invalidate();
      setEmail("");
      setShowConfirmation(false);
      onClose();
      Alert.alert("Success", `Invitation sent to ${email}`);
    },
    onError: (error) => {
      console.error("Failed to send invitation:", error);
      Alert.alert("Error", error.message || "Failed to send invitation");
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

  const isValidEmail = email && email.includes("@");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="border-b border-gray-200 px-4 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold">
                {showConfirmation
                  ? "Confirm Invitation"
                  : "Add Trusted Contact"}
              </Text>
              <Button onPress={handleClose} variant="outline" size="sm">
                Cancel
              </Button>
            </View>
          </View>

          <View className="flex-1 px-4 py-6">
            {!showConfirmation ? (
              <>
                <Text className="mb-4 text-gray-600">
                  Add someone who can view your orders and pick up packages on
                  your behalf.
                </Text>

                <View className="mb-6">
                  <Text className="mb-2 text-base font-medium">
                    Email Address
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base"
                  />
                </View>

                <View className="mt-auto">
                  <Button
                    onPress={handleNext}
                    disabled={!isValidEmail}
                    variant="default"
                  >
                    Next
                  </Button>
                </View>
              </>
            ) : (
              <>
                <View className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <Text className="mb-2 font-medium text-yellow-800">
                    Important Notice
                  </Text>
                  <Text className="mb-2 text-sm text-yellow-700">
                    By adding <Text className="font-semibold">{email}</Text> as
                    a trusted contact, they will be able to:
                  </Text>
                  <View className="ml-4">
                    <Text className="text-sm text-yellow-700">
                      • View all details of your orders
                    </Text>
                    <Text className="text-sm text-yellow-700">
                      • Generate QR codes to pick up your packages
                    </Text>
                    <Text className="text-sm text-yellow-700">
                      • Access this information until you remove them
                    </Text>
                  </View>
                </View>

                <Text className="mb-6 text-gray-600">
                  They will receive a notification to accept this invitation.
                </Text>

                <View className="mt-auto gap-4 space-y-3">
                  <Button
                    onPress={() => setShowConfirmation(false)}
                    disabled={isSubmitting}
                    variant="outline"
                  >
                    Back
                  </Button>
                  <Button
                    onPress={handleConfirm}
                    disabled={isSubmitting}
                    variant="default"
                    loading={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Invitation"}
                  </Button>
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

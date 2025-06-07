import React, { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { UserIcon } from "../../../components/icons";
import AddTrustedContactModal from "../../../components/trusted-contacts/AddTrustedContactModal";
import InvitationCard from "../../../components/trusted-contacts/InvitationCard";
import TrustedContactCard from "../../../components/trusted-contacts/TrustedContactCard";
import BackBreadcrumb from "../../../components/ui/BackBreadcrumb";
import { Button } from "../../../components/ui/Button";
import { api } from "../../../trpc/react";

export default function TrustedContactsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: trustedContactsData,
    isLoading: loadingContacts,
    refetch: refetchContacts,
  } = api.trustedContacts.getMyTrustedContacts.useQuery();
  const {
    data: pendingInvitations,
    isLoading: loadingInvitations,
    refetch: refetchInvitations,
  } = api.trustedContacts.getPendingInvitations.useQuery();

  // Extract arrays from API response
  const grantedContacts = trustedContactsData?.grantedContacts || [];
  const receivedContacts = trustedContactsData?.receivedContacts || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchContacts(), refetchInvitations()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-4 py-4">
          <BackBreadcrumb />
          <View className="mt-4 flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center">
                <View className="mr-2">
                  <UserIcon />
                </View>
                <Text className="text-xl font-semibold">Trusted Contacts</Text>
              </View>
              <Text className="mt-1 text-sm text-gray-600">
                Manage who can view your orders and pick up packages
              </Text>
            </View>
            <Button
              onPress={() => setShowAddModal(true)}
              disabled={grantedContacts.length >= 3}
              variant="default"
              size="sm"
            >
              Add Contact
            </Button>
          </View>
        </View>

        {/* Pending Invitations */}
        {pendingInvitations && pendingInvitations.length > 0 && (
          <View className="border-t border-gray-200 px-4 py-4">
            <Text className="mb-3 text-lg font-semibold">
              Pending Invitations
            </Text>
            <Text className="mb-4 text-sm text-gray-600">
              You have been invited to be a trusted contact for these accounts
            </Text>
            <View>
              {pendingInvitations.map((invitation) => (
                <InvitationCard key={invitation.id} invitation={invitation} />
              ))}
            </View>
          </View>
        )}

        {/* Your Trusted Contacts */}
        <View className="border-t border-gray-200 px-4 py-4">
          <Text className="mb-3 text-lg font-semibold">
            Your Trusted Contacts
          </Text>
          <Text className="mb-4 text-sm text-gray-600">
            These people can view your orders and pick up packages (
            {grantedContacts.length}/3)
          </Text>

          {loadingContacts ? (
            <View className="py-8">
              <Text className="text-center text-gray-500">Loading...</Text>
            </View>
          ) : grantedContacts.length === 0 ? (
            <View className="py-8">
              <Text className="text-center text-gray-500">
                No trusted contacts added yet. Add someone to get started.
              </Text>
            </View>
          ) : (
            <View>
              {grantedContacts.map((contact) => (
                <TrustedContactCard
                  key={contact.id}
                  contact={contact}
                  type="granted"
                />
              ))}
            </View>
          )}
        </View>

        {/* Accounts You Can Access */}
        {receivedContacts.length > 0 && (
          <View className="border-t border-gray-200 px-4 py-4">
            <Text className="mb-3 text-lg font-semibold">
              Accounts You Can Access
            </Text>
            <Text className="mb-4 text-sm text-gray-600">
              You are a trusted contact for these accounts
            </Text>
            <View>
              {receivedContacts.map((contact) => (
                <TrustedContactCard
                  key={contact.id}
                  contact={contact}
                  type="received"
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Trusted Contact Modal */}
      <AddTrustedContactModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
}

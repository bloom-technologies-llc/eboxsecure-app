import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api } from "@/trpc/react";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-qr-code";

import type { RouterOutput } from "@ebox/client-api";

type TrustedContactView =
  RouterOutput["trustedContacts"]["getGrantedContacts"][number];

export default function Page() {
  const { id } = useLocalSearchParams();
  const orderId = Number(id);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingContactIds, setLoadingContactIds] = useState<Set<string>>(
    new Set(),
  );

  const utils = api.useUtils();

  const {
    data: order,
    isLoading: loadingOrder,
    error: orderError,
  } = api.order.get.useQuery(
    { orderId },
    {
      enabled: Boolean(orderId),
    },
  );

  const {
    data: qrCode,
    isLoading: loadingQrCode,
    error: qrCodeError,
  } = api.auth.getAuthorizedPickupToken.useQuery(
    { orderId },
    {
      enabled: Boolean(order && !order.pickedUpAt),
      refetchInterval: 1000 * 60 * 15,
    },
  );

  const {
    data: trustedContacts = [],
    isLoading: loadingTrustedContacts,
    error: trustedContactError,
  } = api.trustedContacts.getGrantedContacts.useQuery();

  const {
    data: orderShareRecords = [],
    isLoading: loadingOrderShareRecords,
    error: orderShareRecordsError,
  } = api.order.getShareAccesses.useQuery({ orderId });

  const { mutate: shareOrder } = api.order.share.useMutation({
    onMutate: ({ trustedContactId }) => {
      setLoadingContactIds((prev) => new Set(prev).add(trustedContactId));
    },
    onSuccess: () => {
      utils.order.getShareAccesses.invalidate({ orderId });
    },
    onError: () => {
      Alert.alert("Error", "Failed to share order. Please try again.");
    },
    onSettled: (_, __, { trustedContactId }) => {
      setLoadingContactIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(trustedContactId);
        return newSet;
      });
    },
  });

  const { mutate: revokeOrderAccess } = api.order.unshare.useMutation({
    onMutate: ({ trustedContactId }) => {
      setLoadingContactIds((prev) => new Set(prev).add(trustedContactId));
    },
    onSuccess: () => {
      utils.order.getShareAccesses.invalidate({ orderId });
    },
    onError: () => {
      Alert.alert("Error", "Failed to revoke access. Please try again.");
    },
    onSettled: (_, __, { trustedContactId }) => {
      setLoadingContactIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(trustedContactId);
        return newSet;
      });
    },
  });

  const filteredContacts = trustedContacts.filter(({ trustedContact }) => {
    const q = searchTerm.toLowerCase();
    const { firstName, lastName, email } = trustedContact;
    return (
      firstName.toLowerCase().includes(q) ||
      lastName.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q)
    );
  });

  const handleToggleShare = (contact: TrustedContactView) => {
    const { trustedContactId } = contact;
    const isCurrentlyShared = orderShareRecords.some(
      (record) => record.sharedWithId === trustedContactId,
    );

    const action = isCurrentlyShared ? revokeOrderAccess : shareOrder;

    action({ orderId, trustedContactId });
  };

  const getSharedInfo = (id: string) =>
    orderShareRecords.find((r) => r.sharedWithId === id);

  const renderTrustedContact = ({
    item: contact,
  }: {
    item: TrustedContactView;
  }) => {
    const isShared = !!getSharedInfo(contact.trustedContactId);
    const sharedInfo = getSharedInfo(contact.trustedContactId);
    const isLoading = loadingContactIds.has(contact.trustedContactId);

    return (
      <TouchableOpacity
        className={`mb-2 flex-row items-center justify-between rounded-lg border p-4 ${
          isShared ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
        } ${isLoading ? "opacity-60" : ""}`}
        onPress={() => handleToggleShare(contact)}
        disabled={isLoading}
      >
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-gray-800">
              {contact.trustedContact.firstName}{" "}
              {contact.trustedContact.lastName}
            </Text>
            {isShared && (
              <View className="rounded-full bg-blue-100 px-2 py-1">
                <Text className="text-xs font-medium text-blue-600">
                  Shared
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-600">
            {contact.trustedContact.email}
          </Text>
          {contact.trustedContact.phoneNumber && (
            <Text className="text-sm text-gray-500">
              {contact.trustedContact.phoneNumber}
            </Text>
          )}
          {isShared && sharedInfo && (
            <Text className="text-xs text-blue-600">
              Shared {new Date(sharedInfo.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
        <View className="ml-4">
          {isLoading ? (
            <ActivityIndicator size={24} color="#3B82F6" />
          ) : isShared ? (
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          ) : (
            <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={{ flex: 1 }} className="bg-white">
      <View className="my-12 flex gap-y-4 bg-white">
        {/* Header with Share Button */}
        <View className="mb-4 flex-row items-center justify-between px-6">
          <Text className="text-2xl font-bold text-gray-900">
            Order Details
          </Text>
          {order && order.directlyOwned && !order.pickedUpAt && (
            <TouchableOpacity
              className="flex-row items-center rounded-lg bg-blue-500 px-4 py-2"
              onPress={() => setShareModalVisible(true)}
            >
              <Ionicons name="share-outline" size={16} color="white" />
              <Text className="ml-2 font-medium text-white">Share</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Shared With Section */}
        {orderShareRecords.length > 0 && (
          <View className="mx-6 mb-4">
            <Text className="mb-2 text-lg font-semibold text-gray-900">
              Shared With ({orderShareRecords.length})
            </Text>
            <View className="rounded-lg bg-blue-50 p-3">
              {orderShareRecords.map((record) => {
                const contact = trustedContacts.find(
                  (tc) => tc.trustedContactId === record.sharedWithId,
                );
                return (
                  <View
                    key={`${record.orderId}-${record.sharedWithId}`}
                    className="mb-1 flex-row items-center"
                  >
                    <Ionicons name="person" size={16} color="#3B82F6" />
                    <Text className="ml-2 text-blue-700">
                      {contact?.trustedContact.firstName}{" "}
                      {contact?.trustedContact.lastName}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Timeline status */}
        <View className="flex-row px-6">
          {[
            { label: "Ordered", active: true },
            { label: "Processed", active: !!order?.processedAt },
            { label: "Delivered", active: !!order?.deliveredDate },
            { label: "Picked up", active: !!order?.pickedUpAt },
          ].map((step, idx, arr) => {
            const isLast = idx === arr.length - 1;
            return (
              <View key={step.label} className="flex-1">
                <View className="items-center">
                  <View className="flex-row items-center">
                    <View
                      className={`${idx === 0 ? "invisible" : ""} h-px flex-1 ${
                        step.active ? "bg-blue-500" : "bg-slate-300"
                      }`}
                    />
                    <View
                      className={`z-10 h-5 w-5 shrink-0 flex-row items-center justify-center rounded-full ${
                        step.active ? "bg-blue-100" : "bg-slate-200"
                      } ring-0 ring-white`}
                    >
                      <View
                        className={`z-11 h-2.5 w-2.5 shrink-0 flex-row items-center justify-center rounded-full ${
                          step.active ? "bg-blue-500" : "bg-slate-400"
                        } ring-0 ring-white`}
                      />
                    </View>
                    <View
                      className={`${isLast ? "invisible" : ""} h-px flex-1 ${
                        arr[idx + 1]?.active ? "bg-blue-500" : "bg-slate-300"
                      }`}
                    />
                  </View>
                </View>
                <View className="mt-3 items-center">
                  <Text className="text-sm font-semibold text-gray-900">
                    {step.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Summary */}
        <View className="mx-6 my-4 border border-[#e4e4e7] p-4">
          <View className="flex flex-row items-center gap-x-3">
            <View className="h-24 w-24 rounded-lg bg-slate-300" />
            <View className="flex gap-y-3">
              <Text className="">Apple Watch Ultra 2</Text>
              <Text className="text-sm">$248.00</Text>
            </View>
          </View>
        </View>

        {/* Order Information */}
        <View className="flex border border-x-0 border-y-8 border-[#e4e4e7]">
          <Text className="mx-6 py-4 text-xl font-medium text-[#333333]">
            At a glance
          </Text>
          <Text>{orderError?.message ?? ""}</Text>
          {loadingOrder ? (
            <ActivityIndicator className="my-4" />
          ) : orderError ? (
            <Text className="mx-6 text-red-500">
              Failed to load order details.
            </Text>
          ) : order ? (
            <View>
              <View className="flex flex-row justify-between border border-[#e4e4e7] px-6 py-5">
                <Text className="text-[#333333]">Order ID #</Text>
                <Text className="text-[#333333]">{order.id}</Text>
              </View>
              <View className="flex flex-row justify-between border border-[#e4e4e7] px-6 py-5">
                <Text className="text-[#333333]">Total Price</Text>
                <Text className="text-[#333333]">${order.total}</Text>
              </View>
              <View className="flex flex-row justify-between border border-[#e4e4e7] px-6 py-5">
                <Text className="text-[#333333]">Customer Email</Text>
                <Text className="text-[#333333]">{order.customer.email}</Text>
              </View>
              <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
                <Text className="text-[#333333]">Customer Phone Number</Text>
                <Text className="text-[#333333]">
                  {order.customer.phoneNumber}
                </Text>
              </View>
              <View className="flex flex-row justify-between border border-t-0 border-[#e4e4e7] px-6 py-5">
                <Text className="text-[#333333]">Shipping Address</Text>
                <Text className="text-[#333333]">
                  {order.shippedLocation.address ?? "—"}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* QR Code Section */}
        <View className="mx-6 flex justify-center">
          <View className="flex gap-y-2">
            {order?.pickedUpAt ? (
              <View className="items-center">
                <Text className="text-center text-xl font-semibold text-[#333]">
                  Order already picked up
                </Text>
                <Text className="text-center text-[#575959]">
                  This order has been picked up and no longer requires a QR
                  code.
                </Text>
              </View>
            ) : loadingQrCode ? (
              <ActivityIndicator className="my-4" />
            ) : qrCodeError ? (
              <Text className="text-center text-red-500">
                Failed to load QR code.
              </Text>
            ) : qrCode ? (
              <>
                <View className="mx-auto flex-1">
                  <QRCode value={qrCode} />
                </View>
                <Text className="text-center text-xl">Scan QR code</Text>
                <Text className="text-center text-[#575959]">
                  Once you arrive at your EBOX location, show the agent your
                  code to pickup your package.
                </Text>
              </>
            ) : (
              <Text className="text-center text-gray-500">
                QR code not available yet.
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Share Modal */}
      <Modal
        visible={shareModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
            <Text className="text-lg font-semibold">Share Order</Text>
            <TouchableOpacity onPress={() => setShareModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Order Info */}
          <View className="border-b border-gray-200 bg-gray-50 p-4">
            <Text className="text-sm text-gray-600">
              Internal Order ID: {orderId}
            </Text>
            <Text className="text-sm text-gray-600">
              Vendor Order #: {order?.vendorOrderId}
            </Text>
            <Text className="mt-2 text-sm text-gray-500">
              Select trusted contacts who can pick up this order on your behalf.
            </Text>
          </View>

          {/* Search Bar */}
          <View className="p-4">
            <View className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                className="ml-2 flex-1 text-base"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
          </View>

          {/* Contacts List */}
          <View className="flex-1 px-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-base font-medium">
                Trusted Contacts ({filteredContacts.length})
              </Text>
              <View className="rounded bg-blue-100 px-2 py-1">
                <Text className="text-xs text-blue-600">
                  {orderShareRecords.length} shared
                </Text>
              </View>
            </View>

            {loadingTrustedContacts || loadingOrderShareRecords ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-2 text-gray-500">Loading contacts...</Text>
              </View>
            ) : trustedContactError || orderShareRecordsError ? (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
                <Text className="mt-2 text-red-500">
                  Failed to load contacts
                </Text>
              </View>
            ) : filteredContacts.length > 0 ? (
              <FlatList
                data={filteredContacts}
                renderItem={renderTrustedContact}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                <Text className="mt-2 text-gray-500">
                  No trusted contacts found
                </Text>
                <Text className="mt-1 text-center text-sm text-gray-400">
                  {searchTerm
                    ? "Try adjusting your search"
                    : "Add trusted contacts in your account settings"}
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View className="border-t border-gray-200 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-500">
                {orderShareRecords.length} contact
                {orderShareRecords.length !== 1 && "s"} can pick up this order
              </Text>
              <TouchableOpacity
                className="rounded-lg bg-gray-200 px-4 py-2"
                onPress={() => setShareModalVisible(false)}
              >
                <Text className="font-medium">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

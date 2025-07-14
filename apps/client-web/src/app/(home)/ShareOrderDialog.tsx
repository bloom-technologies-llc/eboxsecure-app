import { useState } from "react";
import { api } from "@/trpc/react";
import {
  AlertCircle,
  Check,
  Loader2,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import { RouterOutput } from "@ebox/client-api";
import { Alert, AlertDescription } from "@ebox/ui/alert";
import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import { Checkbox } from "@ebox/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ebox/ui/dialog";
import { toast } from "@ebox/ui/hooks/use-toast";
import { Input } from "@ebox/ui/input";
import { Label } from "@ebox/ui/label";
import { Separator } from "@ebox/ui/separator";

interface ShareOrderDialogProps {
  orderId: number;
  vendorOrderId: string;
  onClose: () => void;
}

type TrustedContact =
  RouterOutput["trustedContacts"]["getGrantedContacts"][number];

export default function ShareOrderDialog({
  orderId,
  vendorOrderId,
  onClose,
}: ShareOrderDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const utils = api.useUtils();

  const {
    data: trustedContacts,
    isLoading: loadingTrustedContacts,
    error: trustedContactError,
  } = api.trustedContacts.getGrantedContacts.useQuery();

  const {
    data: orderShareRecords,
    isLoading: loadingOrderShareRecords,
    error: orderShareRecordsError,
  } = api.order.getShareAccesses.useQuery({
    orderId,
  });

  const {
    mutate: shareOrder,
    isPending: sharingOrder,
    error: shareOrderError,
  } = api.order.share.useMutation({
    onSuccess: () => {
      utils.order.getShareAccesses.invalidate({
        orderId,
      });
    },
  });
  const {
    mutate: revokeOrderAccess,
    isPending: revokingOrder,
    error: revokeOrderError,
  } = api.order.unshare.useMutation({
    onSuccess: () => {
      utils.order.getShareAccesses.invalidate({
        orderId,
      });
    },
  });

  const filteredContacts = (trustedContacts ?? []).filter(
    (contact) =>
      contact.trustedContact.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ??
      contact.trustedContact.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ??
      contact.trustedContact.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const isContactShared = (contactId: string) => {
    if (!orderShareRecords) return;
    return orderShareRecords.some(
      (record) => record.sharedWithId === contactId,
    );
  };

  const getSharedContactInfo = (contactId: string) => {
    if (!orderShareRecords) return;

    return orderShareRecords.find(
      (record) => record.sharedWithId === contactId,
    );
  };

  const handleToggleShare = async (
    checked: boolean,
    contact: TrustedContact,
  ) => {
    if (!orderShareRecords) return;

    const { trustedContactId } = contact;

    if (checked) {
      // share order with trusted contact
      shareOrder(
        {
          orderId,
          trustedContactId,
        },
        {
          onSuccess: () => {
            toast({
              variant: "success",
              description: `Shared order with ${contact.trustedContact.firstName}`,
            });
          },
          onError: () => {
            toast({
              variant: "destructive",
              description: "Failed to update sharing. Please try again later.",
            });
          },
        },
      );
    } else {
      //revoke order access with trusted contact
      const orderAccess = orderShareRecords.find(
        (record) => record.sharedWithId === contact.trustedContactId,
      );
      if (!orderAccess) return;
      revokeOrderAccess(
        {
          orderId,
          trustedContactId,
        },
        {
          onSuccess: () => {
            toast({
              variant: "success",
              description: `Revoked access to order with ${getContactName(contact.trustedContact)}`,
            });
          },
          onError: () => {
            toast({
              variant: "destructive",
              description: "Failed to update sharing. Please try again later.",
            });
          },
        },
      );
    }
  };

  const getContactName = (contact: TrustedContact["trustedContact"]) => {
    const { firstName, lastName } = contact;
    return `${firstName} ${lastName}`;
  };

  const loading = loadingOrderShareRecords || loadingTrustedContacts;

  const error = trustedContactError || orderShareRecordsError;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share Order
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">
                  Internal Order ID:
                </span>
                <p className="font-mono text-xs text-gray-600">{orderId}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Vendor Order #:
                </span>
                <p className="font-mono text-xs text-gray-600">
                  {vendorOrderId}
                </p>
              </div>
            </div>
            <p className="pt-2 text-gray-500">
              Select trusted contacts who can pick up this order on your behalf.
            </p>
          </DialogDescription>
        </DialogHeader>

        {/* Notification */}
        {notification && (
          <div
            className={`rounded-md p-3 text-sm ${
              notification.type === "success"
                ? "border border-green-200 bg-green-50 text-green-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Search trusted contacts
            </Label>
            <div className="relative mx-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 "
              />
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center space-y-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">
                Loading contacts and sharing information...
              </p>
            </div>
          )}

          {/* Contacts List */}
          {!loading && (
            <>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Trusted Contacts ({filteredContacts.length})
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {(orderShareRecords ?? []).length} shared
                  </Badge>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>
                        Failed to load trusted contacts or sharing information
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 bg-transparent"
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {filteredContacts.length > 0 ? (
                  <div className="space-y-2">
                    {filteredContacts.map((contact) => {
                      const { trustedContactId } = contact;
                      const isShared = isContactShared(trustedContactId);
                      const sharedInfo = getSharedContactInfo(trustedContactId);

                      return (
                        <div
                          key={contact.id}
                          className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                            isShared
                              ? "border-blue-200 bg-blue-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={isShared}
                              onCheckedChange={(checked) =>
                                handleToggleShare(Boolean(checked), contact)
                              }
                              disabled={sharingOrder ?? revokingOrder}
                              className="data-[state=checked]:border-[#00698F] data-[state=checked]:bg-[#00698F]"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">
                                  {contact.trustedContact.firstName +
                                    " " +
                                    contact.trustedContact.lastName}
                                </p>
                                {isShared && sharedInfo && (
                                  <Badge className="text-xs">Shared</Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {contact.trustedContact.email}
                              </p>
                              {contact.trustedContact.phoneNumber && (
                                <p className="text-xs text-gray-400">
                                  {contact.trustedContact.phoneNumber}
                                </p>
                              )}
                              {isShared && sharedInfo && (
                                <p className="text-xs text-blue-600">
                                  Shared{" "}
                                  {sharedInfo.createdAt.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {isShared ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    <p className="text-sm">No trusted contacts found</p>
                    <p className="text-xs">
                      {searchTerm
                        ? "Try adjusting your search"
                        : "Add trusted contacts in your account settings"}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <Separator />
        <div className="flex items-center justify-between pt-4">
          {!loading && !error && (
            <div className="text-sm text-gray-500">
              {(orderShareRecords ?? []).length} contact
              {(orderShareRecords ?? []).length !== 1 ? "s" : ""} can pick up
              this order
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

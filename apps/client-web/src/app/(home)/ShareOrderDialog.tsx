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

import type { RouterOutput } from "@ebox/client-api";
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

type TrustedContactView =
  RouterOutput["trustedContacts"]["getGrantedContacts"][number];

interface ShareOrderDialogProps {
  orderId: number;
  vendorOrderId: string;
  onClose: () => void;
}

interface ShareOrderDialogHeaderProps {
  orderId: number;
  vendorOrderId: string;
}

interface TrustedContactListProps {
  contacts: TrustedContactView[];
  orderShareRecords: RouterOutput["order"]["getShareAccesses"];
  onToggleShare: (checked: boolean, contact: TrustedContactView) => void;
  loading: boolean;
  error: boolean;
  sharingOrder: boolean;
  revokingOrder: boolean;
  searchTerm: string;
}

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

export default function ShareOrderDialog({
  orderId,
  vendorOrderId,
  onClose,
}: ShareOrderDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const utils = api.useUtils();

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

  const { mutate: shareOrder, isPending: sharingOrder } =
    api.order.share.useMutation({
      onSuccess: () => utils.order.getShareAccesses.invalidate({ orderId }),
    });

  const { mutate: revokeOrderAccess, isPending: revokingOrder } =
    api.order.unshare.useMutation({
      onSuccess: () => utils.order.getShareAccesses.invalidate({ orderId }),
    });

  const loading = Boolean(loadingTrustedContacts || loadingOrderShareRecords);
  const error = Boolean(trustedContactError || orderShareRecordsError);

  const filteredContacts = trustedContacts.filter(({ trustedContact }) => {
    const q = searchTerm.toLowerCase();
    const { firstName, lastName, email } = trustedContact;
    return (
      firstName.toLowerCase().includes(q) ||
      lastName.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q)
    );
  });

  const handleToggleShare = (checked: boolean, contact: TrustedContactView) => {
    const { trustedContactId, trustedContact } = contact;

    const action = checked ? shareOrder : revokeOrderAccess;
    const actionVerb = checked ? "Shared order with" : "Revoked access from";

    action(
      { orderId, trustedContactId },
      {
        onSuccess: () =>
          toast({
            variant: "success",
            description: `${actionVerb} ${trustedContact.firstName} ${trustedContact.lastName}`,
          }),
        onError: () =>
          toast({
            variant: "destructive",
            description: "Something went wrong. Please try again.",
          }),
      },
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-lg">
        <ShareOrderDialogHeader
          orderId={orderId}
          vendorOrderId={vendorOrderId}
        />

        <div className="space-y-4 overflow-hidden">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <TrustedContactList
            contacts={filteredContacts}
            orderShareRecords={orderShareRecords}
            onToggleShare={handleToggleShare}
            loading={loading}
            error={error}
            sharingOrder={sharingOrder}
            revokingOrder={revokingOrder}
            searchTerm={searchTerm}
          />
        </div>

        <Separator />
        <div className="flex justify-between pt-4">
          {!loading && !error && (
            <div className="text-sm text-gray-500">
              {orderShareRecords.length} contact
              {orderShareRecords.length !== 1 && "s"} can pick up this order
            </div>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShareOrderDialogHeader({
  orderId,
  vendorOrderId,
}: ShareOrderDialogHeaderProps) {
  return (
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
            <span className="font-medium text-gray-700">Vendor Order #:</span>
            <p className="font-mono text-xs text-gray-600">{vendorOrderId}</p>
          </div>
        </div>
        <p className="pt-2 text-gray-500">
          Select trusted contacts who can pick up this order on your behalf.
        </p>
      </DialogDescription>
    </DialogHeader>
  );
}

function SearchBar({ searchTerm, setSearchTerm }: SearchBarProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="search">Search trusted contacts</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          id="search"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}

function TrustedContactList({
  contacts,
  orderShareRecords,
  onToggleShare,
  loading,
  error,
  sharingOrder,
  revokingOrder,
  searchTerm,
}: TrustedContactListProps) {
  const getSharedInfo = (id: string) =>
    orderShareRecords.find((r) => r.sharedWithId === id);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-sm text-gray-500">
          Loading contacts and sharing information...
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-96 space-y-2 overflow-y-auto">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Trusted Contacts ({contacts.length})
        </Label>
        <Badge variant="outline" className="text-xs">
          {orderShareRecords.length} shared
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load contacts or sharing info</span>
          </AlertDescription>
        </Alert>
      )}

      {contacts.length > 0 ? (
        contacts.map((contact) => {
          const isShared = !!getSharedInfo(contact.trustedContactId);
          const sharedInfo = getSharedInfo(contact.trustedContactId);

          return (
            <div
              key={contact.id}
              className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                isShared ? "border-blue-200 bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={isShared}
                  onCheckedChange={(checked) =>
                    onToggleShare(Boolean(checked), contact)
                  }
                  disabled={sharingOrder || revokingOrder}
                  className="data-[state=checked]:border-[#00698F] data-[state=checked]:bg-[#00698F]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {contact.trustedContact.firstName}{" "}
                      {contact.trustedContact.lastName}
                    </p>
                    {isShared && <Badge className="text-xs">Shared</Badge>}
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
                      {new Date(sharedInfo.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {isShared ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <div className="h-4 w-4" />
              )}
            </div>
          );
        })
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
  );
}

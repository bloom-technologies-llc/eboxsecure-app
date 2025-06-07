import {
  CircleArrowUp,
  Clock,
  MapPin,
  Package,
  Pencil,
  Users,
} from "lucide-react";

import { Badge } from "@ebox/ui/badge";

import CustomerNotesSection from "./customer-notes-section";
import CustomerOrderHistory from "./customer-order-history";

interface CustomerDetailsCardProps {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phoneNumber: string | null;
    subscription: string | null;
    shippingAddress: string | null;
    user: { createdAt: Date; updatedAt: Date };
    totalOrderCount: number;
    orders: Array<{
      id: number;
      vendorOrderId: string;
      total: number;
      createdAt: Date;
      deliveredDate: Date | null;
      pickedUpAt: Date | null;
      shippedLocation: {
        id: number;
        name: string;
        address: string;
      };
    }>;
    favoriteLocations: Array<{
      id: string;
      isPrimary: boolean;
      location: {
        id: number;
        name: string;
        address: string;
        locationType: string;
      };
    }>;
    trustedContactsGranted: Array<{
      trustedContact: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
      };
    }>;
    trustedContactsReceived: Array<{
      accountHolder: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
      };
    }>;
  };
}

export default function CustomerDetailsCard({
  customer,
}: CustomerDetailsCardProps) {
  const customerName =
    customer.firstName || customer.lastName
      ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
      : "Unnamed Customer";

  const formatSubscriptionDisplay = (subscription: string | null) => {
    switch (subscription) {
      case "BASIC":
        return "Basic";
      case "BASIC_PLUS":
        return "Basic+";
      case "PREMIUM":
        return "Premium";
      case "BUSINESS_PRO":
        return "Business Pro";
      default:
        return "Basic";
    }
  };

  const getSubscriptionBadgeVariant = (subscription: string | null) => {
    switch (subscription) {
      case "BUSINESS_PRO":
        return "default";
      case "PREMIUM":
        return "secondary";
      case "BASIC_PLUS":
        return "outline";
      case "BASIC":
      default:
        return "outline";
    }
  };

  return (
    <>
      {/* Notes Section */}
      <CustomerNotesSection customerId={customer.id} />

      {/* Customer Information */}
      <div className="rounded-lg border border-border bg-white px-6 py-4">
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-3">
            <div className="flex items-center">
              <p className="w-full font-medium">Customer</p>
              <Pencil className="text-gray h-4 w-4" />
            </div>
            <p className="text-sm text-secondary">{customerName}</p>
          </div>

          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Contact Information</p>
            <p className="text-sm text-secondary">
              {customer.email || "No email"}
            </p>
            <p className="text-gray text-sm">
              {customer.phoneNumber || "No phone"}
            </p>
            {customer.shippingAddress && (
              <p className="text-gray text-sm">{customer.shippingAddress}</p>
            )}
          </div>

          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Subscription</p>
            <Badge variant={getSubscriptionBadgeVariant(customer.subscription)}>
              {formatSubscriptionDisplay(customer.subscription)}
            </Badge>
          </div>

          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Account Details</p>
            <div className="flex items-center gap-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <p className="text-gray text-sm">
                Created {new Date(customer.user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <Package className="h-4 w-4 text-gray-400" />
              <p className="text-gray text-sm">
                {customer.totalOrderCount} total orders
              </p>
            </div>
          </div>

          {/* Favorite Locations */}
          {customer.favoriteLocations.length > 0 && (
            <div className="flex flex-col gap-y-3">
              <p className="font-medium">Favorite Locations</p>
              {customer.favoriteLocations.map((favorite) => (
                <div key={favorite.id} className="flex items-center gap-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-col">
                    <p className="text-sm text-secondary">
                      {favorite.location.name}
                      {favorite.isPrimary && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Primary
                        </Badge>
                      )}
                    </p>
                    <p className="text-gray text-xs">
                      {favorite.location.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trusted Contacts */}
          {(customer.trustedContactsGranted.length > 0 ||
            customer.trustedContactsReceived.length > 0) && (
            <div className="flex flex-col gap-y-3">
              <p className="font-medium">Trusted Contacts</p>

              {customer.trustedContactsGranted.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-gray-500">
                    Granted access to:
                  </p>
                  {customer.trustedContactsGranted.map((contact) => (
                    <div
                      key={contact.trustedContact.id}
                      className="mb-1 flex items-center gap-x-2"
                    >
                      <Users className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-secondary">
                        {contact.trustedContact.firstName ||
                        contact.trustedContact.lastName
                          ? `${contact.trustedContact.firstName || ""} ${contact.trustedContact.lastName || ""}`.trim()
                          : contact.trustedContact.email}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {customer.trustedContactsReceived.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-gray-500">
                    Received access from:
                  </p>
                  {customer.trustedContactsReceived.map((contact) => (
                    <div
                      key={contact.accountHolder.id}
                      className="mb-1 flex items-center gap-x-2"
                    >
                      <Users className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-secondary">
                        {contact.accountHolder.firstName ||
                        contact.accountHolder.lastName
                          ? `${contact.accountHolder.firstName || ""} ${contact.accountHolder.lastName || ""}`.trim()
                          : contact.accountHolder.email}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order History */}
      <CustomerOrderHistory
        customerId={customer.id}
        recentOrders={customer.orders}
      />
    </>
  );
}

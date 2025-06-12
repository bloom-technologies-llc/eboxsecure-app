"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Loader2,
  MapPin,
  Package,
} from "lucide-react";

import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";

import { api } from "~/trpc/react";

interface CustomerOrderHistoryProps {
  customerId: string;
  recentOrders: Array<{
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
}

export default function CustomerOrderHistory({
  customerId,
  recentOrders,
}: CustomerOrderHistoryProps) {
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: orderHistory, isLoading } =
    api.customers.getCustomerOrderHistory.useQuery(
      {
        customerId,
        page: currentPage,
        limit: 10,
      },
      {
        enabled: showAllOrders,
      },
    );

  const getOrderStatus = (order: {
    deliveredDate: Date | null;
    pickedUpAt: Date | null;
  }) => {
    if (order.pickedUpAt) {
      return { label: "Picked Up", variant: "outline" as const };
    }
    if (order.deliveredDate) {
      return { label: "Ready for Pickup", variant: "default" as const };
    }
    return { label: "In Transit", variant: "secondary" as const };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const ordersToShow = showAllOrders
    ? orderHistory?.orders || []
    : recentOrders;

  return (
    <div className="rounded-lg border border-border bg-white px-6 py-4">
      <div className="flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <p className="font-medium">Order History</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllOrders(!showAllOrders)}
          >
            {showAllOrders ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show Recent
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show All
              </>
            )}
          </Button>
        </div>

        {isLoading && showAllOrders ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading orders...</span>
          </div>
        ) : ordersToShow.length > 0 ? (
          <div className="space-y-4">
            {ordersToShow.map((order) => {
              const status = getOrderStatus(order);
              return (
                <div
                  key={order.id}
                  className="border-b border-gray-100 pb-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium">
                          Order #{order.vendorOrderId}
                        </p>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>

                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{order.shippedLocation.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Ordered{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {order.deliveredDate && (
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3" />
                            <span>
                              Delivered{" "}
                              {new Date(
                                order.deliveredDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {order.pickedUpAt && (
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3" />
                            <span>
                              Picked up{" "}
                              {new Date(order.pickedUpAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm font-medium">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination for full order history */}
            {showAllOrders &&
              orderHistory &&
              orderHistory.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-500">
                    Page {orderHistory.pagination.page} of{" "}
                    {orderHistory.pagination.totalPages}(
                    {orderHistory.pagination.totalCount} total orders)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!orderHistory.pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
          </div>
        ) : (
          <p className="py-4 text-sm text-gray-500">No orders found</p>
        )}
      </div>
    </div>
  );
}

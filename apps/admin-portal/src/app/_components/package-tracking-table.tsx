"use client";

import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SortDesc,
  X,
} from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";
import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ebox/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ebox/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@ebox/ui/tabs";

type Order = RouterOutputs["orders"]["getAllOrders"]["orders"][number];

export type OrderStatus =
  | "ORDERED"
  | "READY_FOR_PICKUP"
  | "PICKED_UP"
  | "CANCELLED";
export type OrderStatusFilter = "ALL" | OrderStatus;
export type OrderSortField =
  | "order_number"
  | "date"
  | "total_price"
  | "customer_name";
export type OrderSortDirection = "asc" | "desc";

const STATUS_LABELS: Record<OrderStatus, string> = {
  ORDERED: "Ordered",
  READY_FOR_PICKUP: "Ready for pickup",
  PICKED_UP: "Picked up",
  CANCELLED: "Cancelled",
};

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  ORDERED: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  READY_FOR_PICKUP: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  PICKED_UP: "bg-green-100 text-green-800 hover:bg-green-100",
  CANCELLED: "bg-gray-200 text-gray-700 hover:bg-gray-200",
};

const STATUS_TABS: { value: OrderStatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ORDERED", label: STATUS_LABELS.ORDERED },
  { value: "READY_FOR_PICKUP", label: STATUS_LABELS.READY_FOR_PICKUP },
  { value: "PICKED_UP", label: STATUS_LABELS.PICKED_UP },
  { value: "CANCELLED", label: STATUS_LABELS.CANCELLED },
];

const SORT_FIELDS: { value: OrderSortField; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "order_number", label: "Package ID" },
  { value: "total_price", label: "Total" },
  { value: "customer_name", label: "Customer" },
];

// Mirrors the server-side status filter in admin-api `orders.getAllOrders`.
export const getOrderStatus = (order: Order): OrderStatus => {
  if (order.pickedUpAt) return "PICKED_UP";
  if (order.cancelledAt) return "CANCELLED";
  if (order.deliveredDate) return "READY_FOR_PICKUP";
  return "ORDERED";
};

// Orders created by scanning a label have no purchase total (stored as -1).
const formatCurrency = (amount: number): string =>
  amount < 0 ? "N/A" : `$${amount.toFixed(2)} USD`;

const formatDate = (date: Date): string => date.toLocaleDateString();

interface PackageTrackingTableProps {
  orders: Order[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  isLoading: boolean;
  isFetching: boolean;
  errorMessage?: string;
  status: OrderStatusFilter;
  onStatusChange: (status: OrderStatusFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: OrderSortField;
  sortDirection: OrderSortDirection;
  onSortChange: (field: OrderSortField, direction: OrderSortDirection) => void;
  onPageChange: (page: number) => void;
}

export default function PackageTrackingTable({
  orders,
  pagination,
  isLoading,
  isFetching,
  errorMessage,
  status,
  onStatusChange,
  search,
  onSearchChange,
  sortBy,
  sortDirection,
  onSortChange,
  onPageChange,
}: PackageTrackingTableProps) {
  const router = useRouter();

  const preventClose = (e: Event): void => {
    e.preventDefault();
  };

  const hasActiveFilters = status !== "ALL" || search.trim().length > 0;

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white">
      <div className="flex flex-col gap-2 border-b bg-white p-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="overflow-x-auto">
          <Tabs
            value={status}
            onValueChange={(value) =>
              onStatusChange(value as OrderStatusFilter)
            }
          >
            <TabsList className="bg-transparent">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="whitespace-nowrap px-4 data-[state=active]:bg-white data-[state=active]:shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <Loader2
              className="h-4 w-4 animate-spin text-gray-400"
              aria-label="Updating results"
            />
          )}
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              maxLength={100}
              placeholder="Search orders..."
              aria-label="Search orders by package ID, tracking number, customer or store"
              className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 pl-8 text-sm lg:w-64"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <SortDesc className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
              onCloseAutoFocus={preventClose}
            >
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(value) =>
                  onSortChange(value as OrderSortField, sortDirection)
                }
              >
                {SORT_FIELDS.map((field) => (
                  <DropdownMenuRadioItem
                    key={field.value}
                    value={field.value}
                    onSelect={preventClose}
                  >
                    {field.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortDirection}
                onValueChange={(value) =>
                  onSortChange(sortBy, value as OrderSortDirection)
                }
              >
                <DropdownMenuRadioItem
                  value="asc"
                  className="gap-2"
                  onSelect={preventClose}
                >
                  <ArrowUp className="h-4 w-4" /> Ascending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="desc"
                  className="gap-2"
                  onSelect={preventClose}
                >
                  <ArrowDown className="h-4 w-4" /> Descending
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead>Package ID</TableHead>
              <TableHead>Order number</TableHead>
              <TableHead>Tracking number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="h-48 text-center">
                  <span className="inline-flex items-center text-gray-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-gray-400" />
                    Loading orders...
                  </span>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && errorMessage && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="h-48 text-center">
                  <p className="mb-2 text-red-600">Failed to load orders</p>
                  <p className="text-sm text-gray-500">{errorMessage}</p>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !errorMessage && orders.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="h-48 text-center">
                  <p className="text-gray-700">
                    {hasActiveFilters
                      ? "No orders match your search or filter."
                      : "There are no orders yet."}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 gap-1"
                      onClick={() => {
                        onSearchChange("");
                        onStatusChange("ALL");
                      }}
                    >
                      <X className="h-4 w-4" />
                      Clear search and filter
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !errorMessage &&
              orders.map((order) => {
                const orderStatus = getOrderStatus(order);
                return (
                  <TableRow
                    className="cursor-pointer"
                    key={order.id}
                    onClick={() =>
                      router.push(`/orders/order-details/${order.id}`)
                    }
                  >
                    <TableCell>{order.id}</TableCell>
                    <TableCell className="max-w-[14rem] truncate">
                      {order.vendorOrderId}
                    </TableCell>
                    <TableCell>{order.trackingNumber ?? "—"}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      {order.customer.firstName} {order.customer.lastName}
                    </TableCell>
                    <TableCell>{order.shippedLocation.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`whitespace-nowrap ${STATUS_BADGE_CLASSES[orderStatus]}`}
                      >
                        {STATUS_LABELS[orderStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {formatCurrency(order.total)}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalCount > 0 && (
        <div className="flex flex-col gap-2 border-t bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">
            Showing{" "}
            {((pagination.page - 1) * pagination.limit + 1).toLocaleString()}-
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalCount,
            ).toLocaleString()}{" "}
            of {pagination.totalCount.toLocaleString()} orders
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="h-8 gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="h-8 gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, SortDesc } from "lucide-react";

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

type OrderData =
  RouterOutputs["carriers"]["getCarrierDetails"]["orders"][number];
type SortField =
  | "id"
  | "vendorOrderId"
  | "total"
  | "createdAt"
  | "deliveredDate";
type SortDirection = "asc" | "desc";

interface CarrierOrdersTableProps {
  orders: OrderData[];
}

export default function CarrierOrdersTable({
  orders,
}: CarrierOrdersTableProps) {
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const router = useRouter();

  const handleRowClick = (orderId: number) => {
    router.push(`/orders/order-details/${orderId}`);
  };

  const preventClose = (e: Event): void => {
    e.preventDefault();
  };

  // Apply sorting
  const sortedOrders = [...orders].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;

    switch (sortBy) {
      case "id":
        return direction * (a.id - b.id);
      case "vendorOrderId":
        return direction * a.vendorOrderId.localeCompare(b.vendorOrderId);
      case "total":
        return direction * (a.total - b.total);
      case "createdAt":
        return (
          direction *
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        );
      case "deliveredDate":
        const aDate = a.deliveredDate ? new Date(a.deliveredDate).getTime() : 0;
        const bDate = b.deliveredDate ? new Date(b.deliveredDate).getTime() : 0;
        return direction * (aDate - bDate);
      default:
        return 0;
    }
  });

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b bg-white p-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{orders.length} orders</span>
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
                onValueChange={(value: string) => {
                  if (
                    value === "id" ||
                    value === "vendorOrderId" ||
                    value === "total" ||
                    value === "createdAt" ||
                    value === "deliveredDate"
                  ) {
                    setSortBy(value as SortField);
                  }
                }}
              >
                <DropdownMenuRadioItem value="id" onSelect={preventClose}>
                  Order ID
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="vendorOrderId"
                  onSelect={preventClose}
                >
                  Vendor Order ID
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="total" onSelect={preventClose}>
                  Total
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="createdAt"
                  onSelect={preventClose}
                >
                  Order Date
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="deliveredDate"
                  onSelect={preventClose}
                >
                  Delivery Date
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortDirection}
                onValueChange={(value: string) => {
                  if (value === "asc" || value === "desc") {
                    setSortDirection(value as SortDirection);
                  }
                }}
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
              <TableHead>Order ID</TableHead>
              <TableHead>Vendor Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow
                className="cursor-pointer"
                key={order.id}
                onClick={() => handleRowClick(order.id)}
              >
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{order.vendorOrderId}</TableCell>
                <TableCell>
                  {order.customer.firstName && order.customer.lastName
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : order.customer.email || "Unknown Customer"}
                </TableCell>
                <TableCell>{order.shippedLocation.name}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={order.deliveredDate ? "default" : "secondary"}
                    className={
                      order.deliveredDate
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }
                  >
                    {order.deliveredDate ? "Delivered" : "In Transit"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

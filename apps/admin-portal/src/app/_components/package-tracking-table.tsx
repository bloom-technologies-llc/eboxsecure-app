"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Filter,
  Info,
  Plus,
  Search,
  SortDesc,
} from "lucide-react";

import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import { Checkbox } from "@ebox/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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

import { api } from "../../trpc/react";

type Status = "Open" | "Completed" | "Cancelled";
type SortField =
  | "order_number"
  | "date"
  | "status"
  | "total_price"
  | "customer_name";
type SortDirection = "asc" | "desc";

type Order = {
  id: number;
  vendorOrderId: string;
  createdAt: Date;
  total: number;
  deliveredDate: Date | null;
  customer: {
    id: string;
  };
  shippedLocation: {
    name: string;
  };
};

// TODO: Decide if we want to have the order status in the schema
const getOrderStatus = (order: Order): Status => {
  if (order.deliveredDate && order.deliveredDate < new Date()) {
    return "Completed";
  }
  return "Open";
};

const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)} USD`;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

export default function PackageTrackingTable(): JSX.Element {
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const [sortBy, setSortBy] = useState<SortField>("order_number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const router = useRouter();

  const { data: orders } = api.orders.getAllOrders.useQuery();

  const filteredOrders = (() => {
    if (!orders) {
      return [];
    }

    if (filter === "All" && selectedStatuses.length === 0) {
      return orders;
    }

    // If filter is "All" but status filters are selected
    if (filter === "All" && selectedStatuses.length > 0) {
      return orders.filter((order) =>
        selectedStatuses.includes(getOrderStatus(order)),
      );
    }

    // If specific filter is selected and no status filters
    if (filter !== "All" && selectedStatuses.length === 0) {
      return orders.filter((order) => getOrderStatus(order) === filter);
    }

    // If both specific filter and status filters are selected
    if (filter !== "All" && selectedStatuses.length > 0) {
      return orders.filter(
        (order) =>
          getOrderStatus(order) === filter &&
          selectedStatuses.includes(getOrderStatus(order)),
      );
    }

    return orders;
  })();

  // Apply sorting
  const sortedOrders = [...filteredOrders].sort((a: Order, b: Order) => {
    const direction = sortDirection === "asc" ? 1 : -1;

    switch (sortBy) {
      case "order_number":
        return direction * (a.id - b.id);
      case "date":
        return direction * (a.createdAt.getTime() - b.createdAt.getTime());
      case "status":
        return direction * getOrderStatus(a).localeCompare(getOrderStatus(b));
      case "total_price":
        return direction * (a.total - b.total);
      case "customer_name":
        return direction * a.customer.id.localeCompare(b.customer.id);
      default:
        return 0;
    }
  });

  const toggleSelectAll = (): void => {
    setSelectAll((prev) => !prev);
  };

  const handleStatusFilterChange = (status: Status, checked: boolean): void => {
    setSelectedStatuses(
      checked
        ? [...selectedStatuses, status]
        : selectedStatuses.filter((s) => s !== status),
    );
  };

  const clearFilters = (): void => {
    setSelectedStatuses([]);
  };

  const preventClose = (e: Event): void => {
    e.preventDefault();
  };

  const handleRowClick = (orderId: string) => {
    router.push(`orders/order-details/${orderId}`);
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b bg-white p-2">
        <Tabs
          defaultValue="All"
          value={filter}
          onValueChange={(value: string) => {
            if (
              value === "All" ||
              value === "Open" ||
              value === "Completed" ||
              value === "Cancelled"
            ) {
              setFilter(value as "All" | Status);
            }
          }}
        >
          <TabsList className="bg-transparent">
            <TabsTrigger
              value="All"
              className="px-4 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="Open"
              className="px-4 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              Open
            </TabsTrigger>
            <TabsTrigger
              value="Completed"
              className="px-4 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="Cancelled"
              className="px-4 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              Cancelled
            </TabsTrigger>
            <Button variant="ghost" size="icon" className="ml-1 h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="h-8 rounded-md border border-input bg-background px-3 py-1 pl-8 text-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-4 w-4" />
                Filter
                {selectedStatuses.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 rounded-full px-1 text-xs"
                  >
                    {selectedStatuses.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              onCloseAutoFocus={preventClose}
            >
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes("Open")}
                onCheckedChange={(checked: boolean) =>
                  handleStatusFilterChange("Open", checked)
                }
                onSelect={preventClose}
              >
                Open
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes("Completed")}
                onCheckedChange={(checked: boolean) =>
                  handleStatusFilterChange("Completed", checked)
                }
                onSelect={preventClose}
              >
                Completed
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.includes("Cancelled")}
                onCheckedChange={(checked: boolean) =>
                  handleStatusFilterChange("Cancelled", checked)
                }
                onSelect={preventClose}
              >
                Cancelled
              </DropdownMenuCheckboxItem>
              {selectedStatuses.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
                    value === "order_number" ||
                    value === "date" ||
                    value === "status" ||
                    value === "total_price" ||
                    value === "customer_name"
                  ) {
                    setSortBy(value as SortField);
                  }
                }}
              >
                <DropdownMenuRadioItem
                  value="order_number"
                  onSelect={preventClose}
                >
                  Order number
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date" onSelect={preventClose}>
                  Date
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="status" onSelect={preventClose}>
                  Status
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="total_price"
                  onSelect={preventClose}
                >
                  Total price
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="customer_name"
                  onSelect={preventClose}
                >
                  Customer name
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
                  <ArrowUp className="h-4 w-4" /> Oldest first
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="desc"
                  className="gap-2"
                  onSelect={preventClose}
                >
                  <ArrowDown className="h-4 w-4" /> Newest first
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
              <TableHead className="w-12">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all packages"
                />
              </TableHead>
              <TableHead>Package ID</TableHead>
              <TableHead>Tracking number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow
                className="cursor-pointer"
                key={order.id}
                onClick={() => handleRowClick(order.id.toString())}
              >
                <TableCell>
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={toggleSelectAll}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select package ${order.id}`}
                  />
                </TableCell>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.vendorOrderId}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {/* would we want to display customer name instead of id? */}
                    {order.customer.id}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {order.shippedLocation.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{getOrderStatus(order)}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(order.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

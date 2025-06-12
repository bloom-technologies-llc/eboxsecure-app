"use client";

import type { SubscriptionType } from "@prisma/client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
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

import { api } from "~/trpc/react";

type SortField =
  | "name"
  | "subscription"
  | "email"
  | "phone"
  | "orders"
  | "createdAt";
type SortDirection = "asc" | "desc";

interface Customer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  subscription: SubscriptionType | null;
  orders: { id: number }[];
  user: { createdAt: Date };
  selected?: boolean;
}

interface CustomersTableProps {
  className?: string;
}

export default function CustomersTable({ className }: CustomersTableProps) {
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<
    SubscriptionType[]
  >([]);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const router = useRouter();

  // Fetch customers data with pagination
  const {
    data: customersData,
    isLoading,
    error,
  } = api.customers.getAllCustomers.useQuery({
    page: currentPage,
    limit: pageSize,
  });

  const customers = customersData?.customers || [];
  const pagination = customersData?.pagination;

  // Transform and filter data (now only client-side filtering for search and subscription)
  const processedCustomers = useMemo(() => {
    if (!customers) return [];

    let filtered = customers.filter((customer) => {
      // Filter by subscription
      if (
        selectedSubscriptions.length > 0 &&
        (!customer.subscription ||
          !selectedSubscriptions.includes(customer.subscription))
      ) {
        return false;
      }

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const fullName =
          `${customer.firstName || ""} ${customer.lastName || ""}`.toLowerCase();
        const email = (customer.email || "").toLowerCase();
        const phone = (customer.phoneNumber || "").toLowerCase();

        if (
          !fullName.includes(searchLower) &&
          !email.includes(searchLower) &&
          !phone.includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      switch (sortBy) {
        case "name": {
          const aName = `${a.firstName || ""} ${a.lastName || ""}`.trim();
          const bName = `${b.firstName || ""} ${b.lastName || ""}`.trim();
          return direction * aName.localeCompare(bName);
        }
        case "subscription": {
          const aSubscription = a.subscription || "";
          const bSubscription = b.subscription || "";
          return direction * aSubscription.localeCompare(bSubscription);
        }
        case "email": {
          const aEmail = a.email || "";
          const bEmail = b.email || "";
          return direction * aEmail.localeCompare(bEmail);
        }
        case "phone": {
          const aPhone = a.phoneNumber || "";
          const bPhone = b.phoneNumber || "";
          return direction * aPhone.localeCompare(bPhone);
        }
        case "orders": {
          return direction * (a.orders.length - b.orders.length);
        }
        case "createdAt": {
          return (
            direction *
            (new Date(a.user.createdAt).getTime() -
              new Date(b.user.createdAt).getTime())
          );
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [customers, selectedSubscriptions, searchTerm, sortBy, sortDirection]);

  const handleSubscriptionFilterChange = (
    subscription: SubscriptionType,
    checked: boolean,
  ): void => {
    setSelectedSubscriptions(
      checked
        ? [...selectedSubscriptions, subscription]
        : selectedSubscriptions.filter((s) => s !== subscription),
    );
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = (): void => {
    setSelectedSubscriptions([]);
    setSearchTerm("");
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handleSelectAll = (): void => {
    if (selectAll) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(processedCustomers.map((c) => c.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCustomer = (customerId: string): void => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
    setSelectAll(newSelected.size === processedCustomers.length);
  };

  const handleRowClick = (customer: Customer) => {
    router.push(`/customers/${customer.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSelectAll(false);
    setSelectedCustomers(new Set());
  };

  const getSubscriptionBadgeVariant = (
    subscription: SubscriptionType | null,
  ) => {
    switch (subscription) {
      case "BUSINESS_PRO":
        return "bg-blue-300";
      case "PREMIUM":
        return "bg-purple-300";
      case "BASIC_PLUS":
        return "bg-green-300";
      case "BASIC":
      default:
        return "bg-yellow-300";
    }
  };

  const formatSubscriptionDisplay = (subscription: SubscriptionType | null) => {
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

  const preventClose = (e: Event): void => {
    e.preventDefault();
  };

  if (error) {
    return (
      <div className="w-full overflow-hidden rounded-lg border bg-white">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="mb-2 text-red-600">Failed to load customers</p>
            <p className="text-sm text-gray-500">
              {error.message ||
                "An error occurred while fetching customer data"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full overflow-hidden rounded-lg border bg-white ${className || ""}`}
    >
      {/* Header with search and filters */}
      <div className="flex items-center justify-between border-b bg-white p-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="h-8 rounded-md border border-input bg-background px-3 py-1 pl-8 text-sm"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-4 w-4" />
                Filter
                {selectedSubscriptions.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 rounded-full px-1 text-xs"
                  >
                    {selectedSubscriptions.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              onCloseAutoFocus={preventClose}
            >
              <DropdownMenuLabel>Filter by Subscription</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(
                [
                  "BASIC",
                  "BASIC_PLUS",
                  "PREMIUM",
                  "BUSINESS_PRO",
                ] as SubscriptionType[]
              ).map((subscription) => (
                <DropdownMenuCheckboxItem
                  key={subscription}
                  checked={selectedSubscriptions.includes(subscription)}
                  onCheckedChange={(checked) =>
                    handleSubscriptionFilterChange(subscription, checked)
                  }
                  onSelect={preventClose}
                >
                  {formatSubscriptionDisplay(subscription)}
                </DropdownMenuCheckboxItem>
              ))}

              {selectedSubscriptions.length > 0 && (
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
                    value === "name" ||
                    value === "subscription" ||
                    value === "email" ||
                    value === "phone" ||
                    value === "orders" ||
                    value === "createdAt"
                  ) {
                    setSortBy(value as SortField);
                    setCurrentPage(1); // Reset to first page when sorting
                  }
                }}
              >
                <DropdownMenuRadioItem value="name" onSelect={preventClose}>
                  Customer name
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="subscription"
                  onSelect={preventClose}
                >
                  Subscription
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="email" onSelect={preventClose}>
                  Email
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="phone" onSelect={preventClose}>
                  Phone
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="orders" onSelect={preventClose}>
                  Orders
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="createdAt"
                  onSelect={preventClose}
                >
                  Date created
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortDirection}
                onValueChange={(value: string) => {
                  if (value === "asc" || value === "desc") {
                    setSortDirection(value as SortDirection);
                    setCurrentPage(1); // Reset to first page when changing sort direction
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

        {/* Results count */}
        {pagination && (
          <div className="text-sm text-gray-500">
            {((pagination.page - 1) * pagination.limit + 1).toLocaleString()}-
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalCount,
            ).toLocaleString()}{" "}
            of {pagination.totalCount.toLocaleString()} customers
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all customers"
                />
              </TableHead>
              <TableHead>Customer name</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone #</TableHead>
              <TableHead>Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">
                      Loading customers...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : processedCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="text-gray-500">
                    {searchTerm || selectedSubscriptions.length > 0
                      ? "No customers match your filters"
                      : "No customers found"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              processedCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(customer)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedCustomers.has(customer.id)}
                      onCheckedChange={() => handleSelectCustomer(customer.id)}
                      aria-label={`Select customer ${customer.firstName} ${customer.lastName}`}
                    />
                  </TableCell>
                  <TableCell>
                    {customer.firstName || customer.lastName
                      ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
                      : "Unnamed Customer"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getSubscriptionBadgeVariant(
                        customer.subscription,
                      )}
                    >
                      {formatSubscriptionDisplay(customer.subscription)}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.email || "No email"}</TableCell>
                  <TableCell>{customer.phoneNumber || "No phone"}</TableCell>
                  <TableCell>{customer.orders.length} orders</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t bg-white px-4 py-3">
          <div className="flex items-center text-sm text-gray-500">
            Showing{" "}
            {((pagination.page - 1) * pagination.limit + 1).toLocaleString()}-
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalCount,
            ).toLocaleString()}{" "}
            of {pagination.totalCount.toLocaleString()} customers
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
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
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="h-8 gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

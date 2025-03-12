"use client";

import { useState } from "react";
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

type Status = "Open" | "Completed" | "Cancelled";
type SortField =
  | "order_number"
  | "date"
  | "status"
  | "total_price"
  | "customer_name";
type SortDirection = "asc" | "desc";

interface Package {
  id: string;
  trackingNumber: string;
  date: string;
  customer: string;
  customerVerified?: boolean;
  store: string;
  storeVerified?: boolean;
  status: Status;
  total: string;
  selected?: boolean;
}

export default function ClientTable(): JSX.Element {
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [packages, setPackages] = useState<Package[]>([
    {
      id: "1000000017",
      trackingNumber: "113-6838917-0669818",
      date: "11/03/2024",
      customer: "David Smith",
      customerVerified: true,
      store: "Puppy shop",
      storeVerified: true,
      status: "Open",
      total: "$22.00 USD",
    },
    ...Array(7)
      .fill(null)
      .map(
        (): Package => ({
          id: "1000000018",
          trackingNumber: "113-6838917-0669818",
          date: "11/03/2024",
          customer: "David Smith",
          store: "Puppy shop",
          status: "Open",
          total: "$22.00 USD",
        }),
      ),
  ]);

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const [sortBy, setSortBy] = useState<SortField>("order_number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const router = useRouter();

  const toggleSelectAll = (): void => {
    setSelectAll(!selectAll);
    setPackages(
      packages.map(
        (pkg): Package => ({
          id: pkg.id,
          trackingNumber: pkg.trackingNumber,
          date: pkg.date,
          customer: pkg.customer,
          customerVerified: pkg.customerVerified,
          store: pkg.store,
          storeVerified: pkg.storeVerified,
          status: pkg.status,
          total: pkg.total,
          selected: !selectAll,
        }),
      ),
    );
  };

  const toggleSelect = (index: number): void => {
    const newPackages = [...packages];
    newPackages[index] = {
      ...newPackages[index],
      selected: !newPackages[index]?.selected,
    } as Package;
    setPackages(newPackages);

    // Update selectAll state based on if all packages are selected
    setSelectAll(newPackages.every((pkg) => pkg.selected));
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
    router.push(`/order-details/${orderId}`);
  };

  // Filter packages based on tab selection and status filters
  const filteredPackages =
    filter === "All"
      ? selectedStatuses.length > 0
        ? packages.filter((pkg) => selectedStatuses.includes(pkg.status))
        : packages
      : selectedStatuses.length > 0
        ? packages.filter(
            (pkg) =>
              pkg.status === filter && selectedStatuses.includes(pkg.status),
          )
        : packages.filter((pkg) => pkg.status === filter);

  // Apply sorting
  const sortedPackages = [...filteredPackages].sort(
    (a: Package, b: Package) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      switch (sortBy) {
        case "order_number":
          return direction * (Number.parseInt(a.id) - Number.parseInt(b.id));
        case "date":
          return (
            direction *
            (new Date(a.date).getTime() - new Date(b.date).getTime())
          );
        case "status":
          return direction * a.status.localeCompare(b.status);
        case "total_price":
          return (
            direction *
            (Number.parseFloat(a.total.replace("$", "")) -
              Number.parseFloat(b.total.replace("$", "")))
          );
        case "customer_name":
          return direction * a.customer.localeCompare(b.customer);
        default:
          return 0;
      }
    },
  );

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
            {sortedPackages.map((pkg, index) => (
              <TableRow
                className="cursor-pointer"
                key={index}
                onClick={() => handleRowClick(pkg.id)}
              >
                <TableCell>
                  <Checkbox
                    checked={pkg.selected}
                    onCheckedChange={() => toggleSelect(index)}
                    aria-label={`Select package ${pkg.id}`}
                  />
                </TableCell>
                <TableCell>{pkg.id}</TableCell>
                <TableCell>{pkg.trackingNumber}</TableCell>
                <TableCell>{pkg.date}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {pkg.customer}
                    {pkg.customerVerified && (
                      <Info className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {pkg.store}
                    {pkg.storeVerified && (
                      <Info className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{pkg.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{pkg.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

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

type Subscription = "Platinum" | "Bronze";
type SortField = "id" | "name" | "subscription" | "email" | "phone" | "orders";
type SortDirection = "asc" | "desc";

interface Client {
  id: string;
  name: string;
  subscription: Subscription;
  email: string;
  phone: string;
  orders: string;
  selected?: boolean;
}

export default function ClientTable(): JSX.Element {
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1000000017",
      name: "Steven Koh",
      subscription: "Platinum",
      email: "steve.koh@gmail.com",
      phone: "+1 (732)-668-6908",
      orders: "100 orders",
    },
    {
      id: "1000000018",
      name: "Selena pelez",
      subscription: "Platinum",
      email: "steve.koh@gmail.com",
      phone: "+1 (123)-456-6908",
      orders: "223 orders",
    },
    {
      id: "1000000019",
      name: "Alan weng",
      subscription: "Bronze",
      email: "steve.koh@gmail.com",
      phone: "+1 (324)-542-2632",
      orders: "433 orders",
    },
    {
      id: "1000000020",
      name: "Sigrid nunez",
      subscription: "Bronze",
      email: "steve.koh@gmail.com",
      phone: "+1 (631)-243-3264",
      orders: "563 orders",
    },
    {
      id: "1000000021",
      name: "Ryan holiday",
      subscription: "Platinum",
      email: "steve.koh@gmail.com",
      phone: "+1 (345)-456-6443",
      orders: "893 orders",
    },
    {
      id: "1000000022",
      name: "Charlotte bronte",
      subscription: "Bronze",
      email: "steve.koh@gmail.com",
      phone: "+1 (154)-643-5432",
      orders: "900 orders",
    },
    {
      id: "1000000023",
      name: "Ryan S. Jhun",
      subscription: "Platinum",
      email: "steve.koh@gmail.com",
      phone: "+1 (153)-645-7855",
      orders: "921 orders",
    },
    {
      id: "1000000024",
      name: "Heize dean",
      subscription: "Bronze",
      email: "steve.koh@gmail.com",
      phone: "+1 (365)-263-3642",
      orders: "952 orders",
    },
  ]);

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<
    Subscription[]
  >([]);
  const [sortBy, setSortBy] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const router = useRouter();

  const toggleSelectAll = (): void => {
    setSelectAll((prev) => !prev);
    setClients((prev) =>
      prev.map(
        (client): Client => ({
          ...client,
          selected: !selectAll,
        }),
      ),
    );
  };

  const toggleSelect = (index: number): void => {
    const newClients = [...clients];
    newClients[index] = {
      ...newClients[index],
      selected: !newClients[index]?.selected,
    } as Client;
    setClients(newClients);

    // Update selectAll state based on if all clients are selected
    setSelectAll(newClients.every((client) => client.selected));
  };

  const handleSubscriptionFilterChange = (
    subscription: Subscription,
    checked: boolean,
  ): void => {
    setSelectedSubscriptions(
      checked
        ? [...selectedSubscriptions, subscription]
        : selectedSubscriptions.filter((s) => s !== subscription),
    );
  };

  const clearFilters = (): void => {
    setSelectedSubscriptions([]);
  };

  const preventClose = (e: Event): void => {
    e.preventDefault();
  };

  const handleRowClick = (
    clientId: string,
    clientName: string,
    clientPhone: string,
    clientEmail: string,
    clientTier: Subscription,
  ) => {
    router.push(
      `customers/customer-details/${clientId}?name=${clientName}&phone=${clientPhone}&email=${clientEmail}&tier=${clientTier}`,
    );
  };

  // Filter clients based on subscription filters
  const filteredClients = clients.filter((client) => {
    // Filter by selected subscriptions
    if (
      selectedSubscriptions.length > 0 &&
      !selectedSubscriptions.includes(client.subscription)
    ) {
      return false;
    }

    return true;
  });

  // Apply sorting
  const sortedClients = [...filteredClients].sort((a: Client, b: Client) => {
    const direction = sortDirection === "asc" ? 1 : -1;

    switch (sortBy) {
      case "id":
        return direction * (Number.parseInt(a.id) - Number.parseInt(b.id));
      case "name":
        return direction * a.name.localeCompare(b.name);
      case "subscription":
        return direction * a.subscription.localeCompare(b.subscription);
      case "email":
        return direction * a.email.localeCompare(b.email);
      case "phone":
        return direction * a.phone.localeCompare(b.phone);
      case "orders":
        return direction * a.orders.localeCompare(b.orders);
      default:
        return 0;
    }
  });

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b bg-white p-2">
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
              <DropdownMenuCheckboxItem
                checked={selectedSubscriptions.includes("Platinum")}
                onCheckedChange={(checked: boolean) =>
                  handleSubscriptionFilterChange("Platinum", checked)
                }
                onSelect={preventClose}
              >
                Platinum
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedSubscriptions.includes("Bronze")}
                onCheckedChange={(checked: boolean) =>
                  handleSubscriptionFilterChange("Bronze", checked)
                }
                onSelect={preventClose}
              >
                Bronze
              </DropdownMenuCheckboxItem>

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
                    value === "id" ||
                    value === "name" ||
                    value === "subscription" ||
                    value === "email" ||
                    value === "phone" ||
                    value === "orders"
                  ) {
                    setSortBy(value as SortField);
                  }
                }}
              >
                <DropdownMenuRadioItem value="id" onSelect={preventClose}>
                  ID
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name" onSelect={preventClose}>
                  Client name
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
                  aria-label="Select all clients"
                />
              </TableHead>
              <TableHead>Client name</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone #</TableHead>
              <TableHead>Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.map((client, index) => (
              <TableRow
                className="cursor-pointer"
                key={index}
                onClick={() =>
                  handleRowClick(
                    client.id,
                    client.name,
                    client.phone,
                    client.email,
                    client.subscription,
                  )
                }
              >
                <TableCell>
                  <Checkbox
                    checked={client.selected}
                    onCheckedChange={() => toggleSelect(index)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select client ${client.id}`}
                  />
                </TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      client.subscription === "Platinum"
                        ? "bg-blue-300"
                        : "bg-yellow-300"
                    }
                  >
                    {client.subscription}
                  </Badge>
                </TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.orders}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

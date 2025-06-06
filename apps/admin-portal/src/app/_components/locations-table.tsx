"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Filter, Search, SortDesc } from "lucide-react";

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
import { useToast } from "@ebox/ui/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ebox/ui/table";

type Type = "Agent" | "Franchise";
type SortField = "id" | "name" | "type" | "email" | "address";
type SortDirection = "asc" | "desc";

interface Location {
  id: string;
  name: string;
  type: Type;
  email: string;
  address: string;
  selected?: boolean;
}

export default function LocationsTable(): JSX.Element {
  const [locations, setLocations] = useState<Location[]>([
    {
      id: "1000000017",
      name: "Ebox Store Downtown",
      type: "Agent",
      email: "downtown@ebox.com",
      address: "123 Main St, New York, NY 10001",
    },
    {
      id: "1000000018",
      name: "Ebox Midtown",
      type: "Agent",
      email: "midtown@ebox.com",
      address: "456 5th Ave, New York, NY 10018",
    },
    {
      id: "1000000019",
      name: "Ebox Brooklyn",
      type: "Franchise",
      email: "brooklyn@ebox.com",
      address: "789 Atlantic Ave, Brooklyn, NY 11217",
    },
    {
      id: "1000000020",
      name: "Ebox Queens",
      type: "Franchise",
      email: "queens@ebox.com",
      address: "101 Queens Blvd, Queens, NY 11375",
    },
    {
      id: "1000000021",
      name: "Ebox Bronx",
      type: "Agent",
      email: "bronx@ebox.com",
      address: "202 Grand Concourse, Bronx, NY 10451",
    },
    {
      id: "1000000022",
      name: "Ebox Staten Island",
      type: "Franchise",
      email: "statenisland@ebox.com",
      address: "303 Richmond Ave, Staten Island, NY 10314",
    },
    {
      id: "1000000023",
      name: "Ebox Jersey City",
      type: "Agent",
      email: "jerseycity@ebox.com",
      address: "404 Washington St, Jersey City, NJ 07302",
    },
    {
      id: "1000000024",
      name: "Ebox Hoboken",
      type: "Franchise",
      email: "hoboken@ebox.com",
      address: "505 Washington St, Hoboken, NJ 07030",
    },
  ]);

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedTypes, setSelectedTypes] = useState<Type[]>([]);
  const [sortBy, setSortBy] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const router = useRouter();

  const toggleSelectAll = (): void => {
    setSelectAll((prev) => !prev);
    setLocations((prev) =>
      prev.map(
        (location): Location => ({
          ...location,
          selected: !selectAll,
        }),
      ),
    );
  };

  const toggleSelect = (index: number): void => {
    const newLocations = [...locations];
    newLocations[index] = {
      ...newLocations[index],
      selected: !newLocations[index]?.selected,
    } as Location;
    setLocations(newLocations);

    // Update selectAll state based on if all locations are selected
    setSelectAll(newLocations.every((location) => location.selected));
  };

  const handleTypeFilterChange = (type: Type, checked: boolean): void => {
    setSelectedTypes(
      checked
        ? [...selectedTypes, type]
        : selectedTypes.filter((s) => s !== type),
    );
  };

  const clearFilters = (): void => {
    setSelectedTypes([]);
  };

  const preventClose = (e: Event): void => {
    e.preventDefault();
  };

  const handleRowClick = (
    locationId: string,
    locationName: string,
    locationEmail: string,
    locationType: Type,
    locationAddress: string,
  ) => {
    router.push(
      `locations/${locationId}?name=${locationName}&email=${locationEmail}&type=${locationType}&address=${locationAddress}`,
    );
  };

  // Filter locations based on type filters
  const filteredLocations = locations.filter((location) => {
    // Filter by selected types
    if (selectedTypes.length > 0 && !selectedTypes.includes(location.type)) {
      return false;
    }

    return true;
  });

  // Apply sorting
  const sortedLocations = [...filteredLocations].sort(
    (a: Location, b: Location) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      switch (sortBy) {
        case "id":
          return direction * (Number.parseInt(a.id) - Number.parseInt(b.id));
        case "name":
          return direction * a.name.localeCompare(b.name);
        case "type":
          return direction * a.type.localeCompare(b.type);
        case "email":
          return direction * a.email.localeCompare(b.email);
        case "address":
          return direction * a.address.localeCompare(b.address);
        default:
          return 0;
      }
    },
  );

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
                {selectedTypes.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 rounded-full px-1 text-xs"
                  >
                    {selectedTypes.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              onCloseAutoFocus={preventClose}
            >
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes("Agent")}
                onCheckedChange={(checked: boolean) =>
                  handleTypeFilterChange("Agent", checked)
                }
                onSelect={preventClose}
              >
                Agent
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes("Franchise")}
                onCheckedChange={(checked: boolean) =>
                  handleTypeFilterChange("Franchise", checked)
                }
                onSelect={preventClose}
              >
                Franchise
              </DropdownMenuCheckboxItem>

              {selectedTypes.length > 0 && (
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
                    value === "type" ||
                    value === "email" ||
                    value === "address"
                  ) {
                    setSortBy(value as SortField);
                  }
                }}
              >
                <DropdownMenuRadioItem value="id" onSelect={preventClose}>
                  ID
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name" onSelect={preventClose}>
                  Store Name
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="type" onSelect={preventClose}>
                  Type
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="email" onSelect={preventClose}>
                  Email
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="address" onSelect={preventClose}>
                  Address
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
                  aria-label="Select all locations"
                />
              </TableHead>
              <TableHead>Store Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLocations.map((location, index) => (
              <TableRow
                className="cursor-pointer"
                key={index}
                onClick={() =>
                  handleRowClick(
                    location.id,
                    location.name,
                    location.email,
                    location.type,
                    location.address,
                  )
                }
              >
                <TableCell>
                  <Checkbox
                    checked={location.selected}
                    onCheckedChange={() => toggleSelect(index)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select location ${location.id}`}
                  />
                </TableCell>
                <TableCell>{location.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      location.type === "Agent"
                        ? "bg-blue-300"
                        : "bg-yellow-300"
                    }
                  >
                    {location.type}
                  </Badge>
                </TableCell>
                <TableCell>{location.email}</TableCell>
                <TableCell>{location.address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

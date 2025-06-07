"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Filter, Search, SortDesc } from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";
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

type LocationData = RouterOutputs["locations"]["getAllLocations"][number];
type LocationType = "AGENT" | "FRANCHISE";
type SortField =
  | "id"
  | "name"
  | "locationType"
  | "email"
  | "address"
  | "storageCapacity";
type SortDirection = "asc" | "desc";

interface Location extends LocationData {
  selected?: boolean;
}

interface LocationsTableProps {
  locations: LocationData[];
}

export default function LocationsTable({
  locations: initialLocations,
}: LocationsTableProps): React.JSX.Element {
  const [locations, setLocations] = useState<Location[]>(
    initialLocations.map((loc) => ({ ...loc, selected: false })),
  );
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedTypes, setSelectedTypes] = useState<LocationType[]>([]);
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

  const handleTypeFilterChange = (
    type: LocationType,
    checked: boolean,
  ): void => {
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

  const handleRowClick = (locationId: number) => {
    router.push(`/locations/${locationId}`);
  };

  // Filter locations based on type filters
  const filteredLocations = locations.filter((location) => {
    // Filter by selected types
    if (
      selectedTypes.length > 0 &&
      !selectedTypes.includes(location.locationType)
    ) {
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
          return direction * (a.id - b.id);
        case "name":
          return direction * a.name.localeCompare(b.name);
        case "locationType":
          return direction * a.locationType.localeCompare(b.locationType);
        case "email":
          return direction * (a.email || "").localeCompare(b.email || "");
        case "address":
          return direction * a.address.localeCompare(b.address);
        case "storageCapacity":
          return direction * (a.storageCapacity - b.storageCapacity);
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
                checked={selectedTypes.includes("AGENT")}
                onCheckedChange={(checked: boolean) =>
                  handleTypeFilterChange("AGENT", checked)
                }
                onSelect={preventClose}
              >
                Agent
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes("FRANCHISE")}
                onCheckedChange={(checked: boolean) =>
                  handleTypeFilterChange("FRANCHISE", checked)
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
                    value === "locationType" ||
                    value === "email" ||
                    value === "address" ||
                    value === "storageCapacity"
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
                <DropdownMenuRadioItem
                  value="locationType"
                  onSelect={preventClose}
                >
                  Type
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="email" onSelect={preventClose}>
                  Email
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="address" onSelect={preventClose}>
                  Address
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="storageCapacity"
                  onSelect={preventClose}
                >
                  Storage Capacity
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
              <TableHead>Storage Capacity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLocations.map((location, index) => (
              <TableRow
                className="cursor-pointer"
                key={location.id}
                onClick={() => handleRowClick(location.id)}
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
                      location.locationType === "AGENT"
                        ? "bg-blue-300"
                        : "bg-yellow-300"
                    }
                  >
                    {location.locationType === "AGENT" ? "Agent" : "Franchise"}
                  </Badge>
                </TableCell>
                <TableCell>{location.email || "—"}</TableCell>
                <TableCell>{location.address}</TableCell>
                <TableCell>{location.storageCapacity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

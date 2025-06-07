"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, SortDesc } from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";
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

type CarrierData = RouterOutputs["carriers"]["getAllCarriers"][number];
type SortField = "id" | "name" | "contactName" | "contactEmail" | "orderCount";
type SortDirection = "asc" | "desc";

interface CarriersTableProps {
  carriers: CarrierData[];
}

export default function CarriersTable({
  carriers,
}: CarriersTableProps): React.JSX.Element {
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const router = useRouter();

  const handleRowClick = (carrierId: number) => {
    router.push(`/carriers/${carrierId}`);
  };

  const preventClose = (e: Event): void => {
    e.preventDefault();
  };

  // Apply sorting
  const sortedCarriers = [...carriers].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;

    switch (sortBy) {
      case "id":
        return direction * (a.id - b.id);
      case "name":
        return direction * a.name.localeCompare(b.name);
      case "contactName":
        return (
          direction * (a.contactName || "").localeCompare(b.contactName || "")
        );
      case "contactEmail":
        return (
          direction * (a.contactEmail || "").localeCompare(b.contactEmail || "")
        );
      case "orderCount":
        return direction * (a.orderCount - b.orderCount);
      default:
        return 0;
    }
  });

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b bg-white p-2">
        <div className="flex items-center gap-2">
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
                    value === "contactName" ||
                    value === "contactEmail" ||
                    value === "orderCount"
                  ) {
                    setSortBy(value as SortField);
                  }
                }}
              >
                <DropdownMenuRadioItem value="name" onSelect={preventClose}>
                  Carrier Name
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="contactName"
                  onSelect={preventClose}
                >
                  Contact Name
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="contactEmail"
                  onSelect={preventClose}
                >
                  Contact Email
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="orderCount"
                  onSelect={preventClose}
                >
                  Order Count
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
              <TableHead>Carrier Name</TableHead>
              <TableHead>Contact Name</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Contact Phone</TableHead>
              <TableHead>Order Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCarriers.map((carrier) => (
              <TableRow
                className="cursor-pointer"
                key={carrier.id}
                onClick={() => handleRowClick(carrier.id)}
              >
                <TableCell className="font-medium">{carrier.name}</TableCell>
                <TableCell>{carrier.contactName || "—"}</TableCell>
                <TableCell>{carrier.contactEmail || "—"}</TableCell>
                <TableCell>{carrier.contactPhone || "—"}</TableCell>
                <TableCell>{carrier.orderCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

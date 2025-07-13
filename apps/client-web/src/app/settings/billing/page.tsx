"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { createBillingPortalSession } from "@/actions/create-billing-portal-session";
import SettingsLayout from "@/components/settings/settings-layout";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CreditCard, Eye, Plus } from "lucide-react";
import logo from "public/visa_logo.png";

import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ebox/ui/dropdown-menu";
import { EllipsisIcon } from "@ebox/ui/icons/ellipsis";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ebox/ui/table";

interface Billing {
  id: string;
  date: string;
  sub_tier: string;
  status: string;
  total: number;
}

const columns: ColumnDef<Billing>[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "sub_tier",
    header: "Subscription Tier",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "Paid" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const data: Billing[] = [
  {
    id: "728ed52f",
    date: "11/24/2024",
    sub_tier: "Diamond",
    status: "Paid",
    total: 22.0,
  },
  {
    id: "728ed52f",
    date: "11/24/2024",
    sub_tier: "Gold",
    status: "Paid",
    total: 22.0,
  },
  {
    id: "728ed52f",
    date: "11/24/2024",
    sub_tier: "Silver",
    status: "Open",
    total: 22.0,
  },
  {
    id: "728ed52f",
    date: "11/24/2024",
    sub_tier: "Bronze",
    status: "Paid",
    total: 22.0,
  },
];

export default function BillingPage() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing & Payment
            </CardTitle>
            <CardDescription>
              Manage your payment methods and view billing history
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Your saved payment methods for subscriptions
                </CardDescription>
              </div>
              <form action={createBillingPortalSession}>
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Manage Payment Methods
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Click "Manage Payment Methods" to add, edit, or remove your
                payment methods through our secure billing portal.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  Your recent invoices and payment history
                </CardDescription>
              </div>
              <form action={createBillingPortalSession}>
                <Button variant="outline" type="submit">
                  View All Invoices
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Access your complete billing history and download invoices
                through our secure billing portal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}

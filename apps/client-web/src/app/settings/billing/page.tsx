"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import logo from "public/visa_logo.png";

import { Button } from "@ebox/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
    cell: ({ row }) => (
      <div className="w-fit rounded-sm bg-[#f3f3f3] px-4 py-1">
        <p className="text-[#414242]">{row.getValue("status")}</p>
      </div>
    ),
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
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View invoice</DropdownMenuItem>
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
    status: "Open",
    total: 22.0,
  },
  {
    id: "728ed52f",
    date: "11/24/2024",
    sub_tier: "Gold",
    status: "Open",
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
    status: "Open",
    total: 22.0,
  },
];

export default function SettingsPage() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="h-screen bg-[#F3F3F3] pb-28 pt-14">
      {/* <p className="text-2xl">Settings</p> */}
      <div className="mx-auto flex h-full w-full rounded-md border border-[#E4E4E7] bg-white md:w-8/12">
        <div className=" w-2.5/12 border-r border-[#E4E4E7] px-2 py-3">
          <div className="flex flex-col gap-y-3">
            <Link href="/settings">
              <Button className="w-full justify-start bg-white text-start  shadow-none">
                General
              </Button>
            </Link>

            <Link href="/settings/notifications">
              <Button className="w-full justify-start bg-white text-start  shadow-none">
                Notifications
              </Button>
            </Link>

            <Link href="/settings/authorized-pickups">
              <Button className="w-full justify-start bg-white text-start  shadow-none">
                Authorized pickups
              </Button>
            </Link>

            <Link href="/settings/billing">
              <Button className="w-full justify-start bg-[#E4EEF1] text-start text-[#00698F] shadow-none">
                Billing
              </Button>
            </Link>

            <Link href="/">
              <Button className="w-full justify-start bg-white text-start  shadow-none">
                Subscription
              </Button>
            </Link>

            <DropdownMenuSeparator />

            <Button className="w-full justify-start bg-white text-start  shadow-none">
              <Link className="text-[#8F0000]" href="/">
                Delete my account
              </Link>
            </Button>
          </div>
        </div>
        <div className="w-full flex-col">
          <div className="border-b border-[#E4E4E7] p-4">
            <p>Billing</p>
            <p className="text-sm text-[#575959]">
              Update your payment methods & subscription plans
            </p>
          </div>

          <div className="flex flex-col gap-y-4 p-4">
            <p>Payment information</p>

            <div className="flex gap-x-2">
              <div className="flex w-full gap-x-4 rounded-md border border-[#E4E4E7] p-2">
                <div className="flex gap-x-1">
                  <Image src={logo} width={60} height={20} alt="Visa logo" />

                  <div className="flex flex-col">
                    <p className="text-sm text-[#333333]">
                      Visa ending in 7830
                    </p>
                    <p className="text-sm text-[#575959]">Exp. date 6/30</p>
                  </div>
                </div>
                <div className="flex gap-x-2">
                  <Button className="h-fit rounded-sm bg-[#00698F] px-2 py-1 text-sm text-white">
                    <p>Default</p>
                  </Button>
                </div>
              </div>

              <div className="flex w-full gap-x-4 rounded-md border border-[#E4E4E7] p-2">
                <div className="flex gap-x-1">
                  <Image src={logo} width={60} height={20} alt="Visa logo" />

                  <div className="flex flex-col">
                    <p className="text-sm text-[#333333]">
                      Visa ending in 7830
                    </p>
                    <p className="text-sm text-[#575959]">Exp. date 6/30</p>
                  </div>
                </div>
                <p className="text-sm text-[#00698F]">Set default</p>
              </div>
            </div>
          </div>

          <Button className="mx-4 mb-4 h-fit rounded-sm bg-[#00698F] px-2 py-1 text-sm text-white">
            <p>Add payment method</p>
          </Button>

          <DropdownMenuSeparator />

          <div className="m-4 flex flex-col gap-y-2">
            <p className="mb-2">Transaction History</p>
            <div className=" rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

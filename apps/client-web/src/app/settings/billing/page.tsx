"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ColumnDef,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ebox/ui/dropdown-menu";
import { Input } from "@ebox/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ebox/ui/table";

import { EllipsisIcon } from "~/app/icons";

export const columns = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "date",
    header: "Date added",
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Delete user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const data = [
  {
    id: "728ed52f",
    date: "11/24/2024",
    status: "pending",
    email: "michael.jordan@nba.com",
  },
  {
    id: "728ed52f",
    date: "11/24/2024",

    status: "pending",
    email: "jony.ive@apple.com",
  },
  {
    id: "728ed52f",
    date: "11/24/2024",

    status: "pending",
    email: "steve.jobs@apple.com",
  },
  {
    id: "728ed52f",
    date: "11/24/2024",
    status: "pending",
    email: "king.kong@example.com",
  },
  {
    id: "728ed52f",
    date: "11/24/2024",
    status: "Authorized",
    email: "stacy.zhang@example.com",
  },
  {
    id: "489e1d42",
    date: "11/24/2024",
    status: "Authorized",
    email: "melbay@gmail.com",
  },
];

export default function SettingsPage() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="h-screen bg-[#F3F3F3] py-20">
      {/* <p className="text-2xl">Settings</p> */}
      <div className="mx-auto flex h-full w-full rounded-md border border-[#E4E4E7] bg-white md:w-8/12">
        <div className=" w-2.5/12 border-r border-[#E4E4E7] px-2 py-3">
          <div className="flex flex-col gap-y-3">
            <Button className="justify-start bg-white text-start  shadow-none">
              <Link href="/settings">General</Link>
            </Button>

            <Button className="justify-start bg-white text-start  shadow-none">
              <Link href="/settings/notifications">Notifications</Link>
            </Button>

            <Button className="justify-start bg-white text-start  shadow-none">
              <Link href="/settings/authorized-pickups">
                Authorized pickups
              </Link>
            </Button>

            <Button className="justify-start bg-[#E4EEF1] text-start text-[#00698F] shadow-none">
              <Link href="/settings/billing">Billing</Link>
            </Button>

            <Button className="justify-start bg-white text-start  shadow-none">
              <Link href="/">Subscription</Link>
            </Button>

            <DropdownMenuSeparator />

            <Button className="justify-start bg-white text-start  shadow-none">
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
                  <div className="h-fit rounded-sm bg-[#00698F] px-2 py-1 text-sm text-white">
                    <p>Default</p>
                  </div>
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

          <div className="m-4 flex flex-col gap-y-2">
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

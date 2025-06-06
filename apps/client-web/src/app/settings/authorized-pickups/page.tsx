"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@ebox/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ebox/ui/dropdown-menu";
import { EllipsisIcon } from "@ebox/ui/icons/ellipsis";
import { Input } from "@ebox/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ebox/ui/table";

interface AuthorizedPickup {
  id: string;
  status: string;
  email: string;
  date: string;
}
const columns: ColumnDef<AuthorizedPickup>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="bg-pageBackground w-fit rounded-sm px-4 py-1">
        <p className="text-gray">{row.getValue("status")}</p>
      </div>
    ),
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
            <DropdownMenuItem>Delete user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const data: AuthorizedPickup[] = [
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
              <Button className="w-full justify-start bg-[#E4EEF1] text-start text-[#00698F] shadow-none">
                Authorized pickups
              </Button>
            </Link>

            <Link href="/settings/billing">
              <Button className="w-full justify-start bg-white text-start  shadow-none">
                Billing
              </Button>
            </Link>

            <Link href="/">
              <Button className="w-full justify-start bg-white text-start  shadow-none">
                Subscription
              </Button>
            </Link>

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
            <p>Authorized Pickups</p>
            <p className="text-sm text-[#575959]">
              Choose the individuals who are able to pick up packages for you
            </p>
          </div>

          <div className="m-4 flex flex-col gap-y-2">
            <div className=" flex justify-between">
              <Input placeholder="Filter users..." className="max-w-sm" />
              <Button className="bg-[#00698F] text-white">Add user</Button>
            </div>

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

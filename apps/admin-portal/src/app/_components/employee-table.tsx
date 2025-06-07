"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmployeeRole } from "@prisma/client";
import {
  ArrowDown,
  ArrowUp,
  Filter,
  Info,
  Loader2,
  Plus,
  Search,
  SortDesc,
} from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import { Checkbox } from "@ebox/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ebox/ui/dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ebox/ui/form";
import { useToast } from "@ebox/ui/hooks/use-toast";
import { Input } from "@ebox/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ebox/ui/table";

import { api } from "~/trpc/react";

type Type = "AGENT" | "FRANCHISE";
type SortField = "name" | "type" | "role" | "location" | "email" | "createdAt";
type SortDirection = "asc" | "desc";

const formSchema = z.object({
  emailAddress: z.string().email(),
  password: z
    .string({
      message: "Please enter a password", //TODO: set reqs for valid password
    })
    .min(8),
  employeeRole: z.nativeEnum(EmployeeRole),
});

export default function EmployeeTable(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedTypes, setSelectedTypes] = useState<Type[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<EmployeeRole[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(
    new Set(),
  );
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const {
    data: employeesData,
    isLoading,
    error,
  } = api.employees.getAllEmployees.useQuery({
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    typeFilter: selectedTypes.length > 0 ? selectedTypes : undefined,
    roleFilter: selectedRoles.length > 0 ? selectedRoles : undefined,
    sortBy,
    sortDirection,
  });

  const createEmployee = api.user.createEmployee.useMutation({
    onSuccess: () => {
      toast({
        title: "Employee successfully created",
        description: "This user can now sign in immediately",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description: "Please try again later",
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
      employeeRole: EmployeeRole.ASSOCIATE,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createEmployee.mutate({
      emailAddress: values.emailAddress,
      password: values.password,
      employeeRole: values.employeeRole,
    });

    setIsModalOpen(false);
    form.reset();
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const toggleSelectAll = (): void => {
    const employees = employeesData?.employees || [];
    setSelectAll((prev) => !prev);
    if (!selectAll) {
      setSelectedEmployees(new Set(employees.map((emp) => emp.id)));
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const toggleSelect = (employeeId: string): void => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);

    // Update selectAll state
    setSelectAll(newSelected.size === (employeesData?.employees.length || 0));
  };

  const handleTypeFilterChange = (type: Type, checked: boolean): void => {
    setSelectedTypes(
      checked
        ? [...selectedTypes, type]
        : selectedTypes.filter((s) => s !== type),
    );
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleRoleFilterChange = (
    role: EmployeeRole,
    checked: boolean,
  ): void => {
    setSelectedRoles(
      checked
        ? [...selectedRoles, role]
        : selectedRoles.filter((r) => r !== role),
    );
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = (): void => {
    setSelectedTypes([]);
    setSelectedRoles([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const preventClose = (e: Event): void => {
    e.preventDefault();
  };

  const handleRowClick = (employeeId: string) => {
    router.push(`/employees/${employeeId}`);
  };

  const handleLocationClick = (e: React.MouseEvent, locationId: number) => {
    e.stopPropagation(); // Prevent row click
    router.push(`/locations/${locationId}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  if (error) {
    return (
      <div className="w-full overflow-hidden rounded-lg border bg-white">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="mb-2 text-red-600">Failed to load employees</p>
            <p className="text-sm text-gray-500">
              {error.message || "An error occurred while fetching employees"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const employees = employeesData?.employees || [];
  const pagination = employeesData?.pagination;

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b bg-white p-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-3 py-1 pl-8 text-sm"
            />
          </div>

          {/* Remove Add Employee button since creation is out of scope */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-4 w-4" />
                Filter
                {(selectedTypes.length > 0 || selectedRoles.length > 0) && (
                  <Badge
                    variant="secondary"
                    className="ml-1 rounded-full px-1 text-xs"
                  >
                    {selectedTypes.length + selectedRoles.length}
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

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedRoles.includes(EmployeeRole.MANAGER)}
                onCheckedChange={(checked: boolean) =>
                  handleRoleFilterChange(EmployeeRole.MANAGER, checked)
                }
                onSelect={preventClose}
              >
                Manager
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedRoles.includes(EmployeeRole.ASSOCIATE)}
                onCheckedChange={(checked: boolean) =>
                  handleRoleFilterChange(EmployeeRole.ASSOCIATE, checked)
                }
                onSelect={preventClose}
              >
                Associate
              </DropdownMenuCheckboxItem>

              {(selectedTypes.length > 0 || selectedRoles.length > 0) && (
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
                  setSortBy(value as SortField);
                }}
              >
                <DropdownMenuRadioItem value="name" onSelect={preventClose}>
                  Employee name
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="type" onSelect={preventClose}>
                  Type
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="role" onSelect={preventClose}>
                  Role
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="location" onSelect={preventClose}>
                  Location
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="email" onSelect={preventClose}>
                  Email
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="createdAt"
                  onSelect={preventClose}
                >
                  Created Date
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortDirection}
                onValueChange={(value: string) => {
                  setSortDirection(value as SortDirection);
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

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading employees...</span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all employees"
                    />
                  </TableHead>
                  <TableHead>Employee name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone #</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow
                    className="cursor-pointer"
                    key={employee.id}
                    onClick={() => handleRowClick(employee.id)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedEmployees.has(employee.id)}
                        onCheckedChange={() => toggleSelect(employee.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select employee ${employee.id}`}
                      />
                    </TableCell>
                    <TableCell>{employee.fullName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          employee.location.type === "AGENT"
                            ? "bg-blue-300"
                            : "bg-yellow-300"
                        }
                      >
                        {employee.location.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{employee.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={(e) =>
                          handleLocationClick(e, employee.location.id)
                        }
                      >
                        {employee.location.name}
                      </button>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-4">
              <div className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalCount,
                )}{" "}
                of {pagination.totalCount} employees
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

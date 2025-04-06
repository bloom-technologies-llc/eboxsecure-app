"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmployeeRole } from "@prisma/client";
import {
  ArrowDown,
  ArrowUp,
  Filter,
  Info,
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

type Type = "Agent" | "Franchise";
type SortField =
  | "id"
  | "name"
  | "type"
  | "role"
  | "location"
  | "email"
  | "phone";
type SortDirection = "asc" | "desc";

interface Employee {
  id: string;
  name: string;
  type: Type;
  role: EmployeeRole;
  location: string;
  email: string;
  phone: string;
  selected?: boolean;
}

const formSchema = z.object({
  emailAddress: z.string().email(),
  password: z
    .string({
      message: "Please enter a password", //TODO: set reqs for valid password
    })
    .min(8),
  employeeRole: z.nativeEnum(EmployeeRole),
});

export default function EmployeeTable(): JSX.Element {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1000000017",
      name: "Steven Koh",
      type: "Agent",
      role: EmployeeRole.MANAGER,
      location: "Ebox Location #1",
      email: "steve.koh@gmail.com",
      phone: "+1 (732)-668-6908",
    },
    {
      id: "1000000018",
      name: "Selena pelez",
      type: "Agent",
      role: EmployeeRole.ASSOCIATE,
      location: "Ebox Location #1",
      email: "steve.koh@gmail.com",
      phone: "+1 (123)-456-6908",
    },
    {
      id: "1000000019",
      name: "Alan weng",
      type: "Franchise",
      role: EmployeeRole.MANAGER,
      location: "Ebox Location #1",
      email: "steve.koh@gmail.com",
      phone: "+1 (324)-542-2632",
    },
    {
      id: "1000000020",
      name: "Sigrid nunez",
      type: "Franchise",
      role: EmployeeRole.ASSOCIATE,
      location: "Ebox Location #1",
      email: "steve.koh@gmail.com",
      phone: "+1 (631)-243-3264",
    },
    {
      id: "1000000021",
      name: "Ryan holiday",
      type: "Agent",
      role: EmployeeRole.MANAGER,
      location: "Ebox Location #1",
      email: "steve.koh@gmail.com",
      phone: "+1 (345)-456-6443",
    },
    {
      id: "1000000022",
      name: "Charlotte bronte",
      type: "Franchise",
      role: EmployeeRole.ASSOCIATE,
      location: "Ebox Location #1",
      email: "steve.koh@gmail.com",
      phone: "+1 (154)-643-5432",
    },
    {
      id: "1000000023",
      name: "Ryan S. Jhun",
      type: "Agent",
      role: EmployeeRole.MANAGER,
      location: "Ebox Location #1",
      email: "steve.koh@gmail.com",
      phone: "+1 (153)-645-7855",
    },
    {
      id: "1000000024",
      name: "Heize dean",
      type: "Franchise",
      role: EmployeeRole.ASSOCIATE,
      location: "Ebox Location #1",
      email: "steve.koh@gmail.com",
      phone: "+1 (365)-263-3642",
    },
  ]);

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedTypes, setSelectedTypes] = useState<Type[]>([]);
  const [sortBy, setSortBy] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

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

  const toggleSelectAll = (): void => {
    setSelectAll((prev) => !prev);
    setEmployees((prev) =>
      prev.map(
        (employee): Employee => ({
          ...employee,
          selected: !selectAll,
        }),
      ),
    );
  };

  const toggleSelect = (index: number): void => {
    const newEmployees = [...employees];
    newEmployees[index] = {
      ...newEmployees[index],
      selected: !newEmployees[index]?.selected,
    } as Employee;
    setEmployees(newEmployees);

    // Update selectAll state based on if all employees are selected
    setSelectAll(newEmployees.every((employee) => employee.selected));
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
    employeeId: string,
    employeeName: string,
    employeePhone: string,
    employeeEmail: string,
    employeeType: Type,
  ) => {
    router.push(
      `customers/customer-details/${employeeId}?name=${employeeName}&phone=${employeePhone}&email=${employeeEmail}&type=${employeeType}`,
    );
  };

  // Filter employees based on type filters
  const filteredEmployees = employees.filter((employee) => {
    // Filter by selected types
    if (selectedTypes.length > 0 && !selectedTypes.includes(employee.type)) {
      return false;
    }

    return true;
  });

  // Apply sorting
  const sortedEmployees = [...filteredEmployees].sort(
    (a: Employee, b: Employee) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      switch (sortBy) {
        case "id":
          return direction * (Number.parseInt(a.id) - Number.parseInt(b.id));
        case "name":
          return direction * a.name.localeCompare(b.name);
        case "type":
          return direction * a.type.localeCompare(b.type);
        case "role":
          return direction * a.role.localeCompare(b.role);
        case "location":
          return direction * a.location.localeCompare(b.location);
        case "email":
          return direction * a.email.localeCompare(b.email);
        case "phone":
          return direction * a.phone.localeCompare(b.phone);
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
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new employee to the system.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="emailAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employeeRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Role</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            {...field}
                          >
                            <option value="MANAGER">Manager</option>
                            <option value="ASSOCIATE">Associate</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Employee</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
                    value === "role" ||
                    value === "location" ||
                    value === "email" ||
                    value === "phone"
                  ) {
                    setSortBy(value as SortField);
                  }
                }}
              >
                <DropdownMenuRadioItem value="id" onSelect={preventClose}>
                  ID
                </DropdownMenuRadioItem>
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
                <DropdownMenuRadioItem value="phone" onSelect={preventClose}>
                  Phone
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
            {sortedEmployees.map((employee, index) => (
              <TableRow
                className="cursor-pointer"
                key={index}
                onClick={() =>
                  handleRowClick(
                    employee.id,
                    employee.name,
                    employee.phone,
                    employee.email,
                    employee.type,
                  )
                }
              >
                <TableCell>
                  <Checkbox
                    checked={employee.selected}
                    onCheckedChange={() => toggleSelect(index)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select employee ${employee.id}`}
                  />
                </TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      employee.type === "Agent"
                        ? "bg-blue-300"
                        : "bg-yellow-300"
                    }
                  >
                    {employee.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{employee.role}</Badge>
                </TableCell>
                <TableCell>{employee.location}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

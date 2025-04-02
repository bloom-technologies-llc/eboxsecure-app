"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@ebox/ui/input";
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

interface Employee {
  id: string;
  name: string;
  subscription: Subscription;
  email: string;
  phone: string;
  orders: string;
  selected?: boolean;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  subscription: z.enum(["Platinum", "Bronze"], {
    required_error: "Please select a subscription type.",
  }),
});

export default function EmployeeTable(): JSX.Element {
  const [employees, setEmployees] = useState<Employee[]>([
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subscription: "Bronze",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Add your submit logic here
    console.log(values);
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
    employeeId: string,
    employeeName: string,
    employeePhone: string,
    employeeEmail: string,
    employeeTier: Subscription,
  ) => {
    router.push(
      `customers/customer-details/${employeeId}?name=${employeeName}&phone=${employeePhone}&email=${employeeEmail}&tier=${employeeTier}`,
    );
  };

  // Filter employees based on subscription filters
  const filteredEmployees = employees.filter((employee) => {
    // Filter by selected subscriptions
    if (
      selectedSubscriptions.length > 0 &&
      !selectedSubscriptions.includes(employee.subscription)
    ) {
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter employee name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subscription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            {...field}
                          >
                            <option value="Bronze">Bronze</option>
                            <option value="Platinum">Platinum</option>
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
                  Employee name
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
                  aria-label="Select all employees"
                />
              </TableHead>
              <TableHead>Employee name</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone #</TableHead>
              <TableHead>Orders</TableHead>
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
                    employee.subscription,
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
                      employee.subscription === "Platinum"
                        ? "bg-blue-300"
                        : "bg-yellow-300"
                    }
                  >
                    {employee.subscription}
                  </Badge>
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>{employee.orders}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

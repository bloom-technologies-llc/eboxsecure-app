"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmployeeRole } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@ebox/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ebox/ui/select";

import { api } from "~/trpc/react";

const formSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    accountType: z.enum(["EMPLOYEE", "CORPORATE"]),
    employeeRole: z.nativeEnum(EmployeeRole).optional(),
    locationId: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.accountType === "EMPLOYEE") {
        return data.employeeRole !== undefined && data.locationId !== undefined;
      }
      return true;
    },
    {
      message: "Employee role and location are required for employee accounts",
      path: ["employeeRole"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

interface InviteAdminDialogProps {
  children: React.ReactNode;
}

export default function InviteAdminDialog({ children }: InviteAdminDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const utils = api.useUtils();

  const { data: locations } = api.locations.getAllLocations.useQuery(
    undefined,
    { enabled: open },
  );

  const createInvitation = api.invitations.createInvitation.useMutation({
    onSuccess: () => {
      toast({
        title: "Invitation sent",
        description: "The invitation email has been sent successfully",
      });
      setOpen(false);
      form.reset();
      void utils.invitations.getPendingInvitations.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to send invitation",
        description: error.message,
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      accountType: "EMPLOYEE",
      employeeRole: EmployeeRole.ASSOCIATE,
      locationId: undefined,
    },
  });

  const accountType = form.watch("accountType");

  function onSubmit(values: FormValues) {
    createInvitation.mutate({
      email: values.email,
      accountType: values.accountType,
      employeeRole:
        values.accountType === "EMPLOYEE" ? values.employeeRole : undefined,
      locationId:
        values.accountType === "EMPLOYEE" ? values.locationId : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Admin</DialogTitle>
          <DialogDescription>
            Send an invitation to join EboxSecure as an admin or employee.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value === "CORPORATE") {
                        form.setValue("employeeRole", undefined);
                        form.setValue("locationId", undefined);
                      } else {
                        form.setValue("employeeRole", EmployeeRole.ASSOCIATE);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="CORPORATE">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {accountType === "EMPLOYEE" && (
              <>
                <FormField
                  control={form.control}
                  name="employeeRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={EmployeeRole.MANAGER}>
                            Manager
                          </SelectItem>
                          <SelectItem value={EmployeeRole.ASSOCIATE}>
                            Associate
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value, 10))
                        }
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations?.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                              {loc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={createInvitation.isPending}
              >
                {createInvitation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

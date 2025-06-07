"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";
import { UserType } from "@prisma/client";
import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ebox/ui/dialog";

import { api } from "~/trpc/react";
import EmployeeEditForm from "./employee-edit-form";

type EmployeeData = RouterOutputs["employees"]["getEmployeeDetails"];

interface EmployeeDetailsCardProps {
  employee: EmployeeData;
}

export default function EmployeeDetailsCard({
  employee,
}: EmployeeDetailsCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Check if current user is corporate (can edit)
  const { data: userType } = api.user.getUserType.useQuery();
  const canEdit = userType === UserType.CORPORATE;

  return (
    <>
      {/* Employee Information */}
      <div className="rounded-lg border border-border bg-white px-6 py-4">
        <div className="flex flex-col gap-y-6">
          {/* Full Name */}
          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Employee Name</p>
            <p className="text-sm text-secondary">{employee.fullName}</p>
          </div>

          {/* Role and Location (Editable by Corporate) */}
          <div className="flex flex-col gap-y-3">
            <div className="flex items-center">
              <p className="w-full font-medium">Role & Location</p>
              {canEdit && (
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Employee Role & Location</DialogTitle>
                    </DialogHeader>
                    <EmployeeEditForm
                      employeeId={employee.id}
                      initialData={{
                        role: employee.role,
                        locationId: employee.location.id,
                      }}
                      onSuccess={() => setEditDialogOpen(false)}
                      onCancel={() => setEditDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Role:</span>
                <Badge variant="secondary">{employee.role}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
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
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Contact Information</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="text-secondary">{employee.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="text-secondary">
                  {employee.phone || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Location Information</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="text-secondary">{employee.location.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="text-secondary">{employee.location.address}</span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Account Information</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-secondary">
                  {new Date(employee.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
import { Plus } from "lucide-react";

import { Button } from "@ebox/ui/button";

import { api } from "~/trpc/server";
import EmployeeTable from "../../_components/employee-table";
import InviteAdminDialog from "../../_components/invitations/invite-admin-dialog";

export default async function Page() {
  // Employee management is for corporate users and location managers only.
  const userType = await api.user.getUserType();
  const details =
    userType === "EMPLOYEE" ? await api.user.getCurrentUserDetails() : null;
  const canManageEmployees =
    userType === "CORPORATE" || details?.employeeRole === "MANAGER";

  if (!canManageEmployees) {
    return (
      <main className="container h-screen w-full py-16 md:w-9/12">
        <p className="my-4 font-medium">Employees</p>
        <p className="text-sm text-gray-500">
          You do not have access to this page. Employee management is available
          to managers and corporate users.
        </p>
      </main>
    );
  }

  return (
    <main className=" container h-screen w-full py-16 md:w-9/12">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          <div className="my-4 flex items-center justify-between">
            <p className="font-medium">Employees</p>
            <InviteAdminDialog>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Invite Admin
              </Button>
            </InviteAdminDialog>
          </div>
          <EmployeeTable />
        </div>
      </div>
    </main>
  );
}

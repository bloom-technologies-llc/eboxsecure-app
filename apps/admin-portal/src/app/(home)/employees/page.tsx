import { Plus } from "lucide-react";

import { Button } from "@ebox/ui/button";

import EmployeeTable from "../../_components/employee-table";
import InviteAdminDialog from "../../_components/invitations/invite-admin-dialog";
import PendingInvitationsTable from "../../_components/invitations/pending-invitations-table";

export default function Page() {
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

          <div className="mt-8">
            <p className="mb-4 font-medium">Pending Invitations</p>
            <PendingInvitationsTable />
          </div>
        </div>
      </div>
    </main>
  );
}

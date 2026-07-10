"use client";

import { EmployeeRole, UserType } from "@prisma/client";
import { Building2, MapPin } from "lucide-react";

import { Badge } from "@ebox/ui/badge";

import { api } from "~/trpc/react";

const employeeRoleLabels: Record<EmployeeRole, string> = {
  [EmployeeRole.MANAGER]: "Manager",
  [EmployeeRole.ASSOCIATE]: "Associate",
};

export function UserScopeBadge() {
  const { data: userDetails, isLoading } =
    api.user.getCurrentUserDetails.useQuery();

  // Don't render anything while loading.
  if (isLoading || !userDetails) {
    return null;
  }

  // Corporate users are not scoped to a single location.
  if (userDetails.userType === UserType.CORPORATE) {
    return (
      <Badge
        variant="secondary"
        className="gap-1.5 whitespace-nowrap bg-white/80 text-secondary-foreground"
      >
        <Building2 className="h-3.5 w-3.5 shrink-0" />
        <span className="font-semibold">Corporate</span>
        <span className="text-muted-foreground">·</span>
        <span className="font-normal">All locations</span>
      </Badge>
    );
  }

  // Employees are limited to a single location.
  if (
    userDetails.userType === UserType.EMPLOYEE &&
    userDetails.employeeRole
  ) {
    const roleLabel = employeeRoleLabels[userDetails.employeeRole];
    const locationName = userDetails.locationName ?? "Unknown location";

    return (
      <Badge
        variant="secondary"
        className="gap-1.5 whitespace-nowrap bg-white/80 text-secondary-foreground"
        title={
          userDetails.locationCity
            ? `${roleLabel} · ${locationName}, ${userDetails.locationCity}`
            : `${roleLabel} · ${locationName}`
        }
      >
        <span className="font-semibold">{roleLabel}</span>
        <span className="text-muted-foreground">·</span>
        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="max-w-[10rem] truncate font-normal">
          {locationName}
        </span>
      </Badge>
    );
  }

  // Plain customer / unknown user type: render nothing.
  return null;
}

export default UserScopeBadge;

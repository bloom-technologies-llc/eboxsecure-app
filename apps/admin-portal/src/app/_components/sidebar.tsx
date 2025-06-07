"use client";

import { UserButton } from "@clerk/nextjs";
import { UserType } from "@prisma/client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@ebox/ui/sidebar";

import { api } from "~/trpc/react";

type AdminUserType = "EMPLOYEE" | "CORPORATE";

const allOperations = [
  {
    title: "Orders",
    url: "/orders",
    allowedUserTypes: ["EMPLOYEE", "CORPORATE"] as AdminUserType[],
    requiresManagerRole: false,
  },
  {
    title: "Employees",
    url: "/employees",
    allowedUserTypes: ["EMPLOYEE", "CORPORATE"] as AdminUserType[],
    requiresManagerRole: true, // Only managers and corporate can access
  },
  {
    title: "Carriers",
    url: "/carriers",
    allowedUserTypes: ["CORPORATE"] as AdminUserType[], // Only corporate users
    requiresManagerRole: false,
  },
  {
    title: "Locations",
    url: "/locations",
    allowedUserTypes: ["EMPLOYEE", "CORPORATE"] as AdminUserType[],
    requiresManagerRole: false,
  },
  {
    title: "Customers",
    url: "/customers",
    allowedUserTypes: ["EMPLOYEE", "CORPORATE"] as AdminUserType[],
    requiresManagerRole: false,
  },
];

const finances = [
  {
    title: "Payments",
    url: "#",
  },
  {
    title: "Subscriptions",
    url: "#",
  },
];

const AppSidebar = () => {
  const { data: userType, isLoading } = api.user.getUserType.useQuery();
  const { data: userDetails, isLoading: isLoadingDetails } =
    api.user.getCurrentUserDetails.useQuery(undefined, {
      enabled: userType === UserType.EMPLOYEE,
    });

  // Filter operations based on user type and role
  const visibleOperations = allOperations.filter((operation) => {
    if (!userType || userType === UserType.CUSTOMER) return false;

    // Check if user type is allowed
    if (!operation.allowedUserTypes.includes(userType as AdminUserType)) {
      return false;
    }

    // For operations that require manager role, check employee role
    if (operation.requiresManagerRole && userType === UserType.EMPLOYEE) {
      if (!userDetails || userDetails.employeeRole !== "MANAGER") {
        return false;
      }
    }

    return true;
  });

  if (isLoading || (userType === UserType.EMPLOYEE && isLoadingDetails)) {
    return (
      <Sidebar className="top-[--header-height] !h-[calc(100svh-var(--header-height))]">
        <SidebarHeader />
        <SidebarContent>
          <div className="flex items-center justify-center p-4">
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="top-[--header-height] !h-[calc(100svh-var(--header-height))]">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/">
                  <span>Home</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarMenu>
            {visibleOperations.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Finances</SidebarGroupLabel>
          <SidebarMenu>
            {finances.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <p>Users</p>
              <UserButton />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

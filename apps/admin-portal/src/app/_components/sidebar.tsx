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
  },
  {
    title: "Employees",
    url: "/employees",
    allowedUserTypes: ["EMPLOYEE", "CORPORATE"] as AdminUserType[],
  },
  {
    title: "Carriers",
    url: "/carriers",
    allowedUserTypes: ["CORPORATE"] as AdminUserType[], // Only corporate users
  },
  {
    title: "Locations",
    url: "/locations",
    allowedUserTypes: ["EMPLOYEE", "CORPORATE"] as AdminUserType[],
  },
  {
    title: "Customers",
    url: "/customers",
    allowedUserTypes: ["EMPLOYEE", "CORPORATE"] as AdminUserType[],
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

  // Filter operations based on user type
  const visibleOperations = allOperations.filter((operation) => {
    if (!userType || userType === UserType.CUSTOMER) return false;
    return operation.allowedUserTypes.includes(userType as AdminUserType);
  });

  if (isLoading) {
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

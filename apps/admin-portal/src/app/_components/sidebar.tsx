"use client";

import { UserButton } from "@clerk/nextjs";

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
} from "./ui/sidebar";

const operations = [
  {
    title: "Orders",
    url: "#",
  },
  {
    title: "Stores",
    url: "#",
  },
  {
    title: "Carriers",
    url: "#",
  },
  {
    title: "Agents",
    url: "#",
  },
  {
    title: "Employees",
    url: "#",
  },
  {
    title: "Locations",
    url: "#",
  },
  {
    title: "Clients",
    url: "#",
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
  return (
    <Sidebar className="top-[--header-height] !h-[calc(100svh-var(--header-height))]">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>Home</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarMenu>
            {operations.map((item) => (
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

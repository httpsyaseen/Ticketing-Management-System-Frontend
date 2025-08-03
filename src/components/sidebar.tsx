"use client";

import type * as React from "react";
import { Ticket, BarChart3, ChartAreaIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

// Navigation items
const navItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    url: "/dashboard",
  },
  {
    title: "Your Tickets",
    icon: Ticket,
    url: "/user-tickets",
  },
  {
    title: "Reports and Analytics",
    icon: ChartAreaIcon,
    url: "/reports",
  },

  // {
  //   title: "Users",
  //   icon: Users,
  //   url: "/Reports and Analytics",
  // },
  // {
  //   title: "Settings",
  //   icon: Settings,
  //   url: "/settings",
  // },
];

export default function AppSidebar() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <></>;
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="font-semibold">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Ticket className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">TicketPro</span>
                  <span className="text-xs">Management System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={window?.location?.href.includes(item.url)}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span className="text-base">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

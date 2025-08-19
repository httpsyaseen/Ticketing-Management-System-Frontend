"use client";

import type * as React from "react";
import {
  Ticket,
  BarChart3,
  ChartAreaIcon,
  Users,
  FolderClosed,
} from "lucide-react";

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
import Image from "next/image";
import { usePathname } from "next/navigation";

// Navigation items
const navItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    url: "/dashboard",
    superAdminOnly: false,
  },
  {
    title: "Your Tickets",
    icon: Ticket,
    url: "/user-tickets",
    superAdminOnly: false,
  },

  {
    title: "Closed Tickets",
    icon: FolderClosed,
    url: "/closed-tickets",
    superAdminOnly: false,
  },
  {
    title: "Reports and Analytics",
    icon: ChartAreaIcon,
    url: "/reports",
    superAdminOnly: true,
  },
  {
    title: "Old Weekly Reports",
    icon: ChartAreaIcon,
    url: "/old-reports",
    superAdminOnly: true,
  },

  {
    title: "Users",
    icon: Users,
    url: "/users",
    superAdminOnly: true,
  },
];

export default function AppSidebar() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated) {
    return <></>;
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex">
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="font-semibold">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
                  <Image
                    src={
                      "https://psba.gop.pk/wp-content/uploads/2025/03/cropped-SAHULAT-BAZAAR-LOGO.png"
                    }
                    alt="Company Logo"
                    width={40}
                    height={40}
                    className=" mt-5 object-contain mb-4"
                    priority
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">PSBA Ticketing</span>
                  <span className="text-xs">Management System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mt-4 font-bold text-md">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-5">
              {navItems.map((item) => {
                if (item.superAdminOnly && user?.role !== "superadmin") {
                  return null;
                }
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.includes(item.url)}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span className="text-base">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

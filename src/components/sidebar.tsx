"use client";

import type * as React from "react";
import { Ticket, BarChart3, ChartAreaIcon, Users } from "lucide-react";

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
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { title: "Dashboard", icon: BarChart3, url: "/dashboard" },
  { title: "Your Tickets", icon: Ticket, url: "/user-tickets" },
  { title: "Reports and Analytics", icon: ChartAreaIcon, url: "/reports" },
  { title: "Users", icon: Users, url: "/users" },
];

export default function AppSidebar() {
  const { isAuthenticated, user } = useAuth();
  const {openMobile, setOpenMobile} = useSidebar()
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  return (
    <Sidebar className=" border-r border-gray-200">
      {/* Header */}
      <SidebarHeader className="px-5 py-3 bg-white border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="https://psba.gop.pk/wp-content/uploads/2025/03/cropped-SAHULAT-BAZAAR-LOGO.png"
            alt="Company Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-gray-900">
              PSBA Ticketing
            </span>
            <span className="text-xs text-gray-500">Management System</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                if (item.title === "Users" && user?.role !== "superadmin") {
                  return null;
                }

                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? "bg-green-100 text-green-700 font-medium border border-green-200"
                            : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                        }`}
                    >
                      <Link href={item.url}>
                        <item.icon
                          className={`w-5 h-5 ${
                            isActive ? "text-green-600" : "text-gray-500"
                          }`}
                        />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* SidebarRail keeps collapse functionality */}
      <SidebarRail />
    </Sidebar>
  );
}

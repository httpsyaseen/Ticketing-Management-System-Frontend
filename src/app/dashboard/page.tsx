"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { useTicket } from "@/context/ticket-context";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import DashboardTabs from "@/components/DashboardTabs";
import { DataTable } from "@/components/ticketingDataTable/DataTable";
import { getTicketColumns } from "@/components/ticketingDataTable/columns";
import { Ticket } from "@/types/tickets";

export default function TicketManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { setAssignTickets, assignTickets, setViewTicket } = useTicket();
  console.log(user?.assignedTo?._id);
  const [activeTab, setActiveTab] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState("10");

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await api.get(`/ticket/${user?.assignedTo?._id}`);
        const data = res.data;
        if (data?.data?.tickets) {
          setAssignTickets(data?.data?.tickets);
        }
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      }
    }

    if (!isLoading && user?.assignedTo?._id) {
      fetchTickets();
    }
  }, [user, isLoading]);

  console.log("user:", user);
  console.log("API URL:", `/ticket/${user?.assignedTo?._id}`);
  console.log("assignTickets:", assignTickets);

  const filteredTickets = useMemo(() => {
    let filtered = assignTickets;
    if (activeTab !== "all") {
      filtered = filtered.filter((ticket) => {
        const status = ticket.status?.toLowerCase();
        if (activeTab === "resolved") {
          return status === "resolved" || status === "closed";
        }
        return status === activeTab;
      });
    }
    return filtered;
  }, [assignTickets, activeTab]);

  const getTabCount = (status: string) => {
    if (status === "all") return assignTickets.length;
    return assignTickets.filter((ticket) => {
      const s = ticket.status?.toLowerCase();
      if (status === "resolved") return s === "resolved" || s === "closed";
      return s === status;
    }).length;
  };

  const handleViewTicket = (ticket: Ticket) => {
    setViewTicket(ticket);
    router.replace("/ticket/1");
  };

  return (
    <div className="flex bg-gray-50 flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Ticket Management</h1>
      <DashboardTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        getTabCount={getTabCount}
      />
      <DataTable
        columns={getTicketColumns(handleViewTicket)}
        data={filteredTickets}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useTicket } from "@/context/ticket-context";
import DashboardTabs from "@/components/DashboardTabs";
import { DataTable } from "@/components/ticketingDataTable/DataTable";
import { getTicketColumns } from "@/components/ticketingDataTable/columns";
import api from "@/lib/api";
import { Ticket } from "@/types/tickets";

export default function TicketManagementPage() {
  const { user, isLoading } = useAuth();
  const {assignTickets,setAssignTickets,addTicket, setMyTickets, myTickets, setViewTicket } = useTicket();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState("10");

  // Fetch tickets for the current user
  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await api.get(`/ticket/getusertickets`);
        const data = res.data;
        if (data?.data?.tickets) {
          addTicket(data.data.tickets)
          setMyTickets(data.data.tickets);
        }
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      }
    }

    if (!isLoading) {
      fetchTickets();
    }
  }, [user, isLoading, setMyTickets]);

  const filteredTickets = useMemo(() => {
    if (activeTab === "all") return myTickets;

    return myTickets.filter((ticket) => {
      const status = ticket.status?.toLowerCase();
      if (activeTab === "resolved") {
        return status === "resolved" || status === "closed";
      }
      if (activeTab === "in-progress") {
        return status === "in-progress";
      }
      return status === activeTab;
    });
  }, [myTickets, activeTab]);

  // Tab ticket counts
  const getTabCount = (status: string) => {
  if (!Array.isArray(myTickets)) return 0; // Prevent crash

  if (status === "all") return myTickets.length;

  return myTickets.filter((ticket) => {
    const s = ticket.status?.toLowerCase();
    if (status === "resolved") return s === "resolved" || s === "closed";
    if (status === "in-progress") return s === "in-progress";
    return s === status;
  }).length;
};


  // Handle view
  const handleViewTicket = (ticket: Ticket) => {
    setViewTicket(ticket);
    router.replace(`/ticketdetails/${ticket._id}`);
  };

  return (
    <div className="flex bg-gray-50 flex-1 flex-col gap-4 p-4">
      <h1 className="text-3xl  mx-10  font-extrabold">
        {user?.assignedTo?.name}
      </h1>
      <DashboardTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        getTabCount={getTabCount}
        tabs={["all", "open", "in-progress", "resolved"]}
      />
      <DataTable
        columns={getTicketColumns(handleViewTicket)}
        data={filteredTickets || myTickets}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
      />
    </div>
  );
}

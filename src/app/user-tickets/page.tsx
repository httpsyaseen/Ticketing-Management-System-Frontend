"use client";

import * as React from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { useState, useEffect, useMemo } from "react";
import { getStatusBadge } from "@/components/helper-components";
import { formatDateTime, setViewTicket } from "@/utils/helper";
import { Ticket } from "@/types/tickets";
import { useRouter } from "next/navigation";

export default function TicketManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("all");
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Fetch tickets
  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await api.get(`/ticket/getusertickets`);
        const data = res.data;
        if (data?.data?.tickets) {
          setTickets(data.data.tickets);
        }
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      }
    }
    if (!isLoading) {
      fetchTickets();
    }
  }, [user, isLoading]);

  // Filter tickets based on active tab
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    if (activeTab !== "all") {
      filtered = filtered.filter((ticket) => {
        const status = ticket.status?.toLowerCase();
        if (activeTab === "resolved") {
          return status === "resolved" || status === "closed";
        }
        if (activeTab === "in-progress") {
          return status === "in progress";
        }
        return status === activeTab;
      });
    }

    return filtered;
  }, [tickets, activeTab]);

  const getTabCount = (status: string) => {
    if (status === "all") return tickets.length;
    return tickets.filter((ticket) => {
      const s = ticket.status?.toLowerCase();
      if (status === "resolved") return s === "resolved";
      if (status === "in-progress") return s === "in progress";
      return s === status;
    }).length;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ticket Management</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mx-12">
        <div className="py-3.5 flex justify-between">
          <TabsList className="grid w-[60%] grid-cols-4">
            <TabsTrigger value="all">All ({getTabCount("all")})</TabsTrigger>
            <TabsTrigger value="open">Open ({getTabCount("open")})</TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({getTabCount("in-progress")})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({getTabCount("resolved")})
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value={activeTab} className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-7">Title</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Estimated Time</TableHead>
                  <TableHead className="pl-10">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket, index) => (
                    <TableRow key={ticket._id || index}>
                      <TableCell className="font-medium pl-7">
                        {ticket.title}
                      </TableCell>
                      <TableCell>
                        {ticket.createdBy?.assignedTo?.name || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {formatDateTime(ticket.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-sm">
                        {ticket.estimatedResolutionTime
                          ? formatDateTime(ticket.estimatedResolutionTime)
                          : "Not set yet"}
                      </TableCell>
                      <TableCell className="pl-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-black-600 hover:text-black-800 hover:bg-black-50 cursor-pointer"
                          onClick={() => {
                            setViewTicket(ticket);
                            router.push(`/user-tickets/${ticket._id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import * as React from "react";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatDateTime, setTicketsToSessionStorage } from "@/utils/helper";
import { Ticket } from "@/types/tickets";
import { useRouter } from "next/navigation";
import { CreateTicketDialog } from "@/components/createticket-dialog";

export default function TicketManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Fetch tickets from API and save to sessionStorage
  useEffect(() => {
    async function fetchTickets() {
      try {
        console.log("user from main", user);
        const res = await api.get(`/ticket/${user?.assignedTo?._id}`);
        const data = res.data;
        if (data?.data?.tickets) {
          setTickets(data.data.tickets);
          setTicketsToSessionStorage(data.data.tickets);
        }
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      }
    }
    if (!isLoading) {
      fetchTickets();
    }
  }, [user, isLoading]);

  // Filter tickets based on active tab and search query
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((ticket) => {
        // Normalize status for comparison
        const status = ticket.status?.toLowerCase();
        if (activeTab === "resolved") {
          return status === "resolved" || status === "closed";
        }
        return status === activeTab;
      });
    }

    //   // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.createdBy?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [tickets, activeTab, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(
    filteredTickets.length / Number.parseInt(rowsPerPage)
  );
  const startIndex = (currentPage - 1) * Number.parseInt(rowsPerPage);
  const endIndex = startIndex + Number.parseInt(rowsPerPage);
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, rowsPerPage]);

  const getTabCount = (status: string) => {
    if (status === "all") return tickets.length;
    return tickets.filter((ticket) => {
      const s = ticket.status?.toLowerCase();
      if (status === "resolved") return s === "resolved" || s === "closed";
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
          <TabsList className="grid w-[40%] grid-cols-4 ">
            <TabsTrigger value="all">All ({getTabCount("all")})</TabsTrigger>
            <TabsTrigger value="open">Open ({getTabCount("open")})</TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({getTabCount("in-progress")})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({getTabCount("resolved")})
            </TabsTrigger>
          </TabsList>
          <CreateTicketDialog />
        </div>
        <TabsContent value={activeTab} className="space-y-4">
          {/* Search and Filter */}
          {/* <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div> */}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-7">Title</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pl-10">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTickets.map((ticket, index) => (
                    <TableRow key={ticket._id || index}>
                      <TableCell className="font-medium pl-7">
                        {ticket.title}
                      </TableCell>
                      <TableCell>
                        {ticket.createdBy?.assignedTo?.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {formatDateTime(ticket.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="pl-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-black-600 hover:text-black-800 hover:bg-black-50 cursor-pointer"
                          onClick={() => {
                            router.push(`/ticket/${ticket._id}`);
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

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page:
              </span>
              <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(endIndex, filteredTickets.length)} of{" "}
                {filteredTickets.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

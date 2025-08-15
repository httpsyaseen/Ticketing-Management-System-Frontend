"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, TicketIcon, Tag } from "lucide-react"
import { DataTable } from "@/components/ticketingDataTable/DataTable"
import { getTicketColumns } from "@/components/ticketingDataTable/columns"
import type { Ticket } from "@/types/tickets"
import { toast } from "react-hot-toast"
import axios from "axios"
import api from "@/lib/api"
import { useRouter } from "next/navigation";

export default function CloseTicketsPage() {
  const [selectDate, setSelectDate] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [ticketType, setTicketType] = useState<"created" | "assigned">("created")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState("10")
  const router = useRouter()
  const getTickets = async () => {
    if (!selectDate || !fromDate) {
      toast.error("Please select both Select Date and From Date")
      return
    }
    if (new Date(selectDate) > new Date(fromDate)) {
      toast.error("Select Date cannot be later than From Date")
      return
    }

    setIsLoading(true)
    try {
      const res = await api.post("/ticket/get-tickets", {
        startDate: selectDate,
        endDate: fromDate,
        ticketType,
      })

      setTickets(res?.data?.data?.tickets ?? [])
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error?.response?.data?.message || "Failed to fetch tickets")
      } else {
        toast.error("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)

    setSelectDate(weekAgo.toISOString().split("T")[0])
    setFromDate(today.toISOString().split("T")[0])
  }, [])

  const handleViewTicket = (ticket: Ticket) => {
    router.replace(`/ticketdetails/${ticket._id}`);
  }

  const columns = getTicketColumns(handleViewTicket)

  return (
    <div className="flex bg-gray-50 flex-1 flex-col gap-4 p-6">
      {/* Page Header */}
      <div className="flex justify-between">
        <div>
        <h1 className="text-3xl font-bold text-slate-900">Closed Tickets</h1>
        <p className="text-slate-600 text-sm">Search and review your completed support tickets</p>
        </div>
        <div>
         <Button
          onClick={getTickets}
          disabled={isLoading}
          className="h-11 bg-green-600 hover:bg-green-700 text-white font-medium"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-3"></div>
              Searching...
            </>
          ) : (
            <>
              <TicketIcon className="h-4 w-4 mr-2" /> Get Tickets
            </>
          )}
        </Button>
                </div>

      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 mt-5 md:grid-cols-4 gap-6 items-end">
        <div className="space-y-1">
          <Label htmlFor="selectDate" className="flex items-center  gap-2">
            <CalendarDays className="w-4 h-4  text-green-600" /> Select Date
          </Label>
          <Input id="selectDate" className="bg-white" type="date" value={selectDate} onChange={(e) => setSelectDate(e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="fromDate" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-green-600" /> From Date
          </Label>
          <Input id="fromDate" className="bg-white" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>

        <div className="space-y-1 ">
          <Label htmlFor="ticketType" className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-600" /> Ticket Type
          </Label>

          <Select value={ticketType} onValueChange={(value: "created" | "assigned") => setTicketType(value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created by Me</SelectItem>
              <SelectItem value="assigned">Assigned to Me</SelectItem>
            </SelectContent>
          </Select>
        </div>

       
      </div>

      {/* Table */}
      {tickets.length > 0 ? (
        <DataTable className="bg-white -ml-[2px]" columns={columns} data={tickets} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
      ) : (
        !isLoading && (
          <div className="text-center py-12 text-slate-500">
            <TicketIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No tickets found for the selected date range.</p>
          </div>
        )
      )}
    </div>
  )
}

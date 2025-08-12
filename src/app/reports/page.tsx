"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/context/auth-context"
import { Ticket, Clock, CheckCircle, AlertCircle } from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  LineChart,
  Line
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart"

import type { TicketData, StatusCounts } from "@/types/tickets"
import StateCards from "@/components/reports/StateCards"
import ChartCards from "@/components/reports/ChartCards"
import { useTicket } from "@/context/ticket-context"
import StatCards from "@/components/reports/StateCards"

// // Mock Data
// const mockTickets: TicketData[] = [
//   { _id: "1", title: "Login bug", status: "Open", priority: "High", createdAt: "2025-08-01", assignedTo: { name: "Alice" } },
//   { _id: "2", title: "UI alignment", status: "In-Progress", priority: "Medium", createdAt: "2025-07-15", assignedTo: { name: "Bob" } },
//   { _id: "3", title: "Server crash", status: "Resolved", priority: "High", createdAt: "2025-06-10", assignedTo: { name: "Charlie" } },
//   { _id: "4", title: "Slow response", status: "Open", priority: "Low", createdAt: "2025-08-05", assignedTo: { name: "Dana" } }
// ]

export default function ReportsPage() {
  const { user, isLoading } = useAuth()
//   const [tickets, setTickets] = useState<TicketData[]>([])
const {myTickets,setMyTickets} = useTicket()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
       setMyTickets(myTickets)
        setLoading(false)
      }, 1000)
    }
  }, [user, isLoading])

  const statusCounts: StatusCounts = useMemo(() => {
    const counts = { all: myTickets.length, open: 0, inProgress: 0, resolved: 0 }
    myTickets.forEach(ticket => {
      const s = ticket.status.toLowerCase()
      if (s === "open") counts.open++
      else if (s === "in-progress") counts.inProgress++
      else if (s === "resolved") counts.resolved++
    })
    return counts
  }, [myTickets])

  const statusChartData = [
    { name: "Open", value: statusCounts.open, color: "#ef4444" },
    { name: "In Progress", value: statusCounts.inProgress, color: "#f59e0b" },
    { name: "Resolved", value: statusCounts.resolved, color: "#10b981" }
  ]

  const priorityData = useMemo(() => {
    const priorityCounts = { high: 0, medium: 0, low: 0 }
    myTickets.forEach((t) => {
      const p = t.priority.toLowerCase()
      if (p === "high") priorityCounts.high++
      else if (p === "medium") priorityCounts.medium++
      else if (p === "low") priorityCounts.low++
    })
    return [
      { name: "High", count: priorityCounts.high },
      { name: "Medium", count: priorityCounts.medium },
      { name: "Low", count: priorityCounts.low }
    ]
  }, [myTickets])

  const monthlyTrendData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString("en-US", { month: "short" })
      const monthTickets = myTickets.filter(t => new Date(t.createdAt).getMonth() === date.getMonth())
      months.push({
        month: monthName,
        created: monthTickets.length,
        resolved: monthTickets.filter(t => t.status.toLowerCase() === "resolved").length
      })
    }
    return months
  }, [myTickets])

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow-sm">
        Loading analytics...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-xs text-gray-500 mt-1">Insights into ticket activity and performance trends</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
<StatCards
  title="All Tickets"
  value={statusCounts.all}
  icon={Ticket}
  color="text-blue-600"
  bgColor="bg-blue-100"
  description="Total tickets created"
/>

<StatCards
  title="Open"
  value={statusCounts.open}
  icon={AlertCircle}
  color="text-red-600"
  bgColor="bg-red-100"
  description="Awaiting attention"
/>

<StatCards
  title="In Progress"
  value={statusCounts.inProgress}
  icon={Clock}
  color="text-amber-600"
  bgColor="bg-amber-100"
  description="Currently being worked on"
/>

<StatCards
  title="Resolved"
  value={statusCounts.resolved}
  icon={CheckCircle}
  color="text-green-600"
  bgColor="bg-green-100"
  description="Successfully completed"
/>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <ChartCards title="Status Distribution" description="Current ticket status breakdown" className="">
          <ChartContainer config={{ open: { label: "Open", color: "#ef4444" }, inProgress: { label: "In Progress", color: "#f59e0b" }, resolved: { label: "Resolved", color: "#10b981" } }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={5}>
                  {statusChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCards>

        {/* Priority Distribution */}
        <ChartCards title="Priority Distribution" description="Tickets by priority level" className="">
          <ChartContainer config={{ high: { label: "High", color: "#ef4444" }, medium: { label: "Medium", color: "#f59e0b" }, low: { label: "Low", color: "#3b82f6" } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCards>

        {/* Monthly Trend */}
        <ChartCards title="Monthly Trend" description="Tickets created vs resolved over last 6 months" className="w-full ">
          <ChartContainer config={{ created: { label: "Created", color: "#3b82f6" }, resolved: { label: "Resolved", color: "#10b981" } }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCards>
      </div>
    </div>
  )
}

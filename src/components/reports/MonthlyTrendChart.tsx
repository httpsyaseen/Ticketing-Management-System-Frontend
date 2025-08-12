// "use client"

// import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Legend, LineChart, Line } from "recharts"
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
// import ChartCards from "@/components/reports/ChartCards"

// interface MonthlyTrendProps {
//   monthlyTrendData: { month: string; created: number; resolved: number }[]
// }

// export function MonthlyTrendChart({ monthlyTrendData }: MonthlyTrendProps) {
//   return (
//     <ChartCards
//       title="Monthly Trend"
//       description="Tickets created vs resolved over last 6 months"
//       className="lg:col-span-2 h-80"
//     >
//       <ChartContainer
//         config={{
//           created: { label: "Created", color: "#3b82f6" },
//           resolved: { label: "Resolved", color: "#10b981" },
//         }}
//       >
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={monthlyTrendData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" />
//             <YAxis />
//             <ChartTooltip content={<ChartTooltipContent />} />
//             <Legend />
//             <Line
//               type="monotone"
//               dataKey="created"
//               stroke="#3b82f6"
//               strokeWidth={2}
//               dot={{ fill: "#3b82f6" }}
//             />
//             <Line
//               type="monotone"
//               dataKey="resolved"
//               stroke="#10b981"
//               strokeWidth={2}
//               dot={{ fill: "#10b981" }}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </ChartContainer>
//     </ChartCards>
//   )
// }

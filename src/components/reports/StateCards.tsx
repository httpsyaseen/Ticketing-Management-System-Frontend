"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color: string // text color (e.g. "text-green-600")
  bgColor: string // background color (e.g. "bg-green-50")
  description: string
}

export default function StatCards({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  description
}: StatCardProps) {
  return (
    <Card className={`border border-gray-200 hover:shadow-lg rounded-xl transition-all duration-200 ${bgColor}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-gray-500">{title}</CardTitle>
        <Icon className={`h-8 w-8 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-bold ${color}`}>{value}</div>
        <p className="text-sm  font-medium text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ReactNode } from "react"

interface ChartCardProps {
  title: string
  description: string
  children: ReactNode
  className?: string
}

export default function ChartCards({ title, description, children, className }: ChartCardProps) {
  return (
    <Card
      className={`bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 ${className || ""} `}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">{children}</CardContent>
    </Card>
  )
}

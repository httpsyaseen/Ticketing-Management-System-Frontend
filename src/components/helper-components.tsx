"use client";

import { Badge } from "@/components/ui/badge";

export function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "open":
      return (
        <Badge className="inline-flex items-center justify-center rounded-full px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
          Open
        </Badge>
      );
    case "in-progress":
      return (
        <Badge className="inline-flex items-center justify-center rounded-full px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-sm font-medium">
          In Progress
        </Badge>
      );
    case "resolved":
    case "closed":
      return (
        <Badge className="inline-flex items-center justify-center rounded-full px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-sm font-medium">
          Resolved
        </Badge>
      );
    default:
      return (
        <Badge className="inline-flex items-center justify-center rounded-full px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium">
          {status || "Unknown"}
        </Badge>
      );
  }
}

export function getPriorityBadge(priority: string) {
  switch (priority?.toLowerCase()) {
    case "low":
      return (
        <Badge className="inline-flex items-center justify-center rounded-full px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-sm font-medium">
          Low
        </Badge>
      );
    case "medium":
      return (
        <Badge className="inline-flex items-center justify-center rounded-full px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-sm font-medium">
          Medium
        </Badge>
      );
    case "high":
      return (
        <Badge className="inline-flex items-center justify-center rounded-full px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
          High
        </Badge>
      );
    default:
      return (
        <Badge className="inline-flex items-center justify-center rounded-full px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium">
          {priority || "Not set yet"}
        </Badge>
      );
  }
}

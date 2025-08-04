"use client";

import { Badge } from "@/components/ui/badge";

export function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "open":
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
          Open
        </Badge>
      );
    case "in progress":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
          In Progress
        </Badge>
      );
    case "resolved":
    case "closed":
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          Resolved
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDateTime } from "@/utils/helper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeeklyReport } from "@/types/report"; // your type
import { generateExcelReport } from "@/utils/helper"; // move your fn here
import { Download, Pencil } from "lucide-react";

export const getWeeklyReportColumns = (
    onDownload: (report: WeeklyReport) => void
): ColumnDef<WeeklyReport>[] => [
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {formatDateTime(row.original.createdAt)}
                </span>
            ),
        },
        {
            accessorKey: "clearedByItAt",
            header: "Cleared By IT At",
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.clearedByItAt
                        ? formatDateTime(row.original.clearedByItAt)
                        : "Not cleared"}
                </span>
            ),
        },
        {
            accessorKey: "clearedByMonitoringAt",
            header: "Cleared By Monitoring At",
            cell: ({ row }) => (
                <span className="text-sm flex justify-center">
                    {row.original.clearedByMonitoringAt
                        ? formatDateTime(row.original.clearedByMonitoringAt)
                        : "Not cleared"}
                </span>
            ),
        },
        {
            accessorKey: "clearedByOperationsAt",
            header: "Cleared By Operations At",
            cell: ({ row }) => (
                <span className="text-sm flex justify-center">
                    {row.original.clearedByOperationsAt
                        ? formatDateTime(row.original.clearedByOperationsAt)
                        : "Not cleared"}
                </span>
            ),
        },

        {
            id: "download",
            header: "Download Report",
            cell: ({ row }) => (
              <div className="flex gap-2">
        {/* ✅ Download Button */}
        <Button
          variant="outline"
          size="sm"
          className="flex justify-center gap-2"
          onClick={() => onDownload(row.original)}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>        
      </div>
            ),
        },
        {
            id:"update",
            header:"Update Report",
            cell:({ row }) => (

            <Button
          variant="outline"
          size="sm"
          className="flex justify-center gap-2"
        //   onClick={() => onUpdate(row.original)}
        >
          <Pencil className="h-4 w-4" />
          Update
        </Button>
           ),
        }
        
    ];

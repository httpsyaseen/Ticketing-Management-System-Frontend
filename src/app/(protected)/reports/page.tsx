"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Eye, FileSpreadsheet, MessageSquare } from "lucide-react";

import * as XLSX from "xlsx";
import api from "@/lib/api";

interface MarketReport {
  _id: string;
  marketId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  isSubmitted: boolean;
  updatedAt: string;
  biometricStatus?: boolean;
  faultyCCTV?: number;
  faultyMetalDetectors?: number;
  faultyWalkthroughGates?: number;
  totalCCTV?: number;
  walkthroughGates?: number;
  metalDetectors?: number;
  comments?: string;
}

interface WeeklyReport {
  _id: string;
  createdAt: string;
  marketsReport: MarketReport[];
  clearedByIt: boolean;
}

export default function SecurityReportsPage() {
  const [reportData, setReportData] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MarketReport | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchWeeklyReport();
  }, []);

  const fetchWeeklyReport = async () => {
    try {
      setLoading(true);
      const { data } = await api("/report/get-weekly-report");
      setReportData(data.data.report);
    } catch (error) {
      console.error("Error fetching weekly report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedReport || !comment.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await fetch(
        `/api/report/update-security-report/${selectedReport._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comments: comment }),
        }
      );

      if (response.ok) {
        setComment("");
        fetchWeeklyReport(); // Refresh data
      } else {
        throw new Error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const generateExcelReport = () => {
    if (!reportData) return;

    const excelData = reportData.marketsReport.map((report) => ({
      "Sahulat Bazaar Name": report.marketId.name,
      CCTV: report.totalCCTV || 0,
      "Faulty CCTV": report.faultyCCTV || 0,
      "Walkthrough Gates": report.walkthroughGates || 0,
      "Faulty Walkthrough Gates": report.faultyWalkthroughGates || 0,
      "Metal Detectors": report.metalDetectors || 0,
      "Faulty Metal Detectors": report.faultyMetalDetectors || 0,
      "Biometric Status( Yes / No )": report.biometricStatus ? "Yes" : "No",
      "Comments / Remarks by the IT Department": report.comments || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Security Report");

    const fileName = `Security_Report_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleViewReport = (market: MarketReport) => {
    setSelectedReport(market);
    setComment(market.comments || "");
  };

  const allMarkets = reportData?.marketsReport || [];
  const submittedMarkets = allMarkets.filter((market) => market.isSubmitted);
  const notSubmittedMarkets = allMarkets.filter(
    (market) => !market.isSubmitted
  );
  const allSubmitted =
    allMarkets.length > 0 && allMarkets.every((market) => market.isSubmitted);

  const renderMarketTable = (markets: MarketReport[]) => (
    <Table className="bg-white rounded-md">
      <TableHeader>
        <TableRow>
          <TableHead>Market Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>CCTV Status</TableHead>
          <TableHead>Metal Detectors</TableHead>
          <TableHead>Walkthrough Gates</TableHead>
          <TableHead>Biometric</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {markets.map((market) => (
          <TableRow key={market._id}>
            <TableCell className="font-medium">
              {market.marketId.name}
            </TableCell>
            <TableCell>
              <Badge variant={market.isSubmitted ? "default" : "secondary"}>
                {market.isSubmitted ? "Submitted" : "Not Submitted"}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(market.updatedAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {market.isSubmitted ? (
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {market.totalCCTV || 0} Total
                  </div>
                  <Badge
                    variant={market.faultyCCTV ? "destructive" : "default"}
                    className="text-xs"
                  >
                    {market.faultyCCTV || 0} Faulty
                  </Badge>
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              {market.isSubmitted ? (
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {market.metalDetectors || 0} Total
                  </div>
                  <Badge
                    variant={
                      market.faultyMetalDetectors ? "destructive" : "default"
                    }
                    className="text-xs"
                  >
                    {market.faultyMetalDetectors || 0} Faulty
                  </Badge>
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              {market.isSubmitted ? (
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {market.walkthroughGates || 0} Total
                  </div>
                  <Badge
                    variant={
                      market.faultyWalkthroughGates ? "destructive" : "default"
                    }
                    className="text-xs"
                  >
                    {market.faultyWalkthroughGates || 0} Faulty
                  </Badge>
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              {market.isSubmitted ? (
                <Badge
                  variant={market.biometricStatus ? "default" : "destructive"}
                >
                  {market.biometricStatus ? "Active" : "Inactive"}
                </Badge>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              {market.isSubmitted && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(market)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">
                        {market.marketId.name} - Security Report Details
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-base font-medium">
                              CCTV Information
                            </Label>
                            <div className="p-4 border rounded-lg bg-muted/50">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm text-muted-foreground">
                                    Total CCTV
                                  </Label>
                                  <div className="text-2xl font-bold">
                                    {market.totalCCTV || 0}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm text-muted-foreground">
                                    Faulty CCTV
                                  </Label>
                                  <div className="text-2xl font-bold text-destructive">
                                    {market.faultyCCTV || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-base font-medium">
                              Metal Detectors
                            </Label>
                            <div className="p-4 border rounded-lg bg-muted/50">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm text-muted-foreground">
                                    Total Units
                                  </Label>
                                  <div className="text-2xl font-bold">
                                    {market.metalDetectors || 0}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm text-muted-foreground">
                                    Faulty Units
                                  </Label>
                                  <div className="text-2xl font-bold text-destructive">
                                    {market.faultyMetalDetectors || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-base font-medium">
                              Walkthrough Gates
                            </Label>
                            <div className="p-4 border rounded-lg bg-muted/50">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm text-muted-foreground">
                                    Total Gates
                                  </Label>
                                  <div className="text-2xl font-bold">
                                    {market.walkthroughGates || 0}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm text-muted-foreground">
                                    Faulty Gates
                                  </Label>
                                  <div className="text-2xl font-bold text-destructive">
                                    {market.faultyWalkthroughGates || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-base font-medium">
                              Biometric System
                            </Label>
                            <div className="p-4 border rounded-lg bg-muted/50">
                              <div className="flex items-center justify-center">
                                <Badge
                                  variant={
                                    market.biometricStatus
                                      ? "default"
                                      : "destructive"
                                  }
                                  className="text-lg px-4 py-2"
                                >
                                  {market.biometricStatus
                                    ? "Active"
                                    : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 border-t pt-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="comment"
                            className="text-base font-medium"
                          >
                            IT Department Comments / Remarks
                          </Label>
                          <Textarea
                            id="comment"
                            placeholder="Enter your comments or remarks about this security report..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                          <div className="flex justify-end">
                            <Button
                              onClick={handleAddComment}
                              disabled={submittingComment || !comment.trim()}
                              size="sm"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              {submittingComment ? "Saving..." : "Save Comment"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading weekly report...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 px-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Weekly Security Reports</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateExcelReport} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Generate Excel Report
          </Button>
          {allSubmitted && <Button>Compile Report</Button>}
        </div>
      </div>

      <div className="">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-[40%] grid-cols-3">
            <TabsTrigger value="all">
              All Markets ({allMarkets.length})
            </TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted ({submittedMarkets.length})
            </TabsTrigger>
            <TabsTrigger value="not-submitted">
              Not Submitted ({notSubmittedMarkets.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsContent value="all">{renderMarketTable(allMarkets)}</TabsContent>

        <TabsContent value="submitted">
          {renderMarketTable(submittedMarkets)}
        </TabsContent>

        <TabsContent value="not-submitted">
          {renderMarketTable(notSubmittedMarkets)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Ticket } from "@/types/tickets";
import * as XLSX from "xlsx";
import { WeeklyReport } from "@/types/report";

function formatDateTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-US", options);
}

function setCurrentTicket(t: Ticket) {
  const ticket = JSON.stringify(t);
  sessionStorage.setItem("currentTicket", ticket);
  return;
}

function getCurrentTicket(): Ticket | null {
  const t = sessionStorage.getItem("currentTicket");
  return t ? JSON.parse(t) : null;
}

const generateExcelReport = (reportData: WeeklyReport) => {
  if (!reportData) return;

  const excelData = reportData.marketsReport.map((report) => ({
    "Sahulat Bazaar Name": report.marketId.name,
    "Created At": formatDateTime(report.createdAt),
    Submitted: report.isSubmitted ? "Yes" : "No",
    "Submitted At": report.submittedAt
      ? formatDateTime(report.submittedAt)
      : "N/A",
    CCTV: report.totalCCTV || 0,
    "Faulty CCTV": report.faultyCCTV || 0,
    "Walkthrough Gates": report.walkthroughGates || 0,
    "Faulty Walkthrough Gates": report.faultyWalkthroughGates || 0,
    "Metal Detectors": report.metalDetectors || 0,
    "Faulty Metal Detectors": report.faultyMetalDetectors || 0,
    "Biometric Status": report.biometricStatus ? "Yes" : "No",
    Comments: report.comments || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Security Report");

  const fileName = `Security_Report_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export {
  formatDateTime,
  setCurrentTicket,
  getCurrentTicket,
  formatTime,
  generateExcelReport,
};

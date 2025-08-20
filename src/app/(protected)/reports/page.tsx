"use client";

import SecurityReportsPage from "./report-page";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { WeeklyReport } from "@/types/report";

import { useAuth } from "@/context/auth-context";

export default function Page() {
  const [reportData, setReportData] = useState<WeeklyReport>(
    {} as WeeklyReport
  );
  // const { user } = useAuth();
  const [loading, setLoading] = useState(true);
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

  // if (!reportData?.clearedByIt) {
  //   return null;
  // }

  return (
    <div>
      <SecurityReportsPage
        reportData={reportData}
        loading={loading}
        setReportData={setReportData}
      />
    </div>
  );
}

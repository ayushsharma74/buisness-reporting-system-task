// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import AnalyticsCard from "@/components/AnalyticsCard";
import MonthlyRevenue from "@/components/MonthlyRevenue";
import RevenueAnalysis, {
  MonthlyRevenueData,
  SummaryData,
} from "@/components/RevenueAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndianRupee, ChartLine, CreditCard, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";

interface SelectOption {
  value: string;
  label: string;
}

export default function Home() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenueData[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for selected month range
  const [startMonth, setStartMonth] = useState<SelectOption | null>(null);
  const [endMonth, setEndMonth] = useState<SelectOption | null>(null);

  const [monthOptions, setMonthOptions] = useState<SelectOption[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("merchantId", "1");
      if (startDate) {
        params.append("startDate", format(startDate, "yyyy-MM-dd"));
      }
      if (endDate) {
        params.append("endDate", format(endDate, "yyyy-MM-dd"));
      }

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || ""
        }/api/reports/monthly-growth?${params.toString()}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch monthly data: ${res.status}`);
      }
      const monthlyData = await res.json();
      setMonthlyData(monthlyData);

      const generatedMonthOptions: SelectOption[] = monthlyData.map(
        (item) => ({
          value: `${item.month}-${item.year}`,
          label: `${item.month} ${item.year}`,
        })
      );
      setMonthOptions(generatedMonthOptions);

      // Set start month to the maximum starting point after options are generated
      if (generatedMonthOptions.length > 0 && !startMonth) {
        setStartMonth(generatedMonthOptions[0]);
      }

      const res1 = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || ""
        }/api/reports/summary?${params.toString()}`,
        { cache: "no-store" }
      );
      if (!res1.ok) {
        throw new Error(`Failed to fetch summary data: ${res1.status}`);
      }
      const summaryData = await res1.json();
      setSummaryData(summaryData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, startMonth]); // Removed startMonth from dependency array

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMonthlyData = monthlyData.filter((item) => {
    if (!startMonth || !endMonth) return true;

    const itemMoment = moment(`${item.month} ${item.year}`, "MMM YYYY");
    const startMoment = moment(startMonth.value, "MMM-YYYY");
    const endMoment = moment(endMonth.value, "MMM-YYYY");

    return (
      itemMoment.isSameOrAfter(startMoment) &&
      itemMoment.isSameOrBefore(endMoment)
    );
  });

  const recalculatedSummaryData: any =
    summaryData && filteredMonthlyData.length > 0 // Check summaryData exists before proceeding
      ? {
          totalRevenue: filteredMonthlyData.reduce(
            (sum, item) => sum + item.revenue,
            0
          ),
          netProfit: summaryData?.netProfit || 0,
          totalExpenses: summaryData?.totalExpenses || 0,
          totalPayment: summaryData?.totalCustomers || 0,
        }
      : summaryData || {
          // Provide a default object when summaryData is null
          totalRevenue: 0,
          netProfit: 0,
          totalExpenses: 0,
          totalPayment: 0,
        };

  return (
    <main className="flex flex-col gap-3 py-3">
      <>
        <div className="flex gap-4">
          {/* Start Month Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Month
            </label>
            <Select
              onValueChange={(value) => {
                const selectedOption =
                  monthOptions.find((option) => option.value === value) || null;
                setStartMonth(selectedOption);
              }}
              value={startMonth?.value || ""}
              disabled
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select start month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* End Month Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Month
            </label>
            <Select
              onValueChange={(value) => {
                const selectedOption =
                  monthOptions.find((option) => option.value === value) || null;
                setEndMonth(selectedOption);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select end month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <AnalyticsCard
            value={
              "$" + (recalculatedSummaryData?.totalRevenue || 0).toFixed(2)
            }
            icon={IndianRupee}
            title="Total Revenue"
          />
          <AnalyticsCard
            value={
              "$" + (recalculatedSummaryData?.netProfit || 0).toFixed(2)
            }
            icon={ChartLine}
            title="Net Profit"
          />
          <AnalyticsCard
            value={
              "$" + (recalculatedSummaryData?.totalExpenses || 0).toFixed(2)
            }
            icon={CreditCard}
            title="Total Expenses"
          />
          <AnalyticsCard
            value={recalculatedSummaryData?.totalPayment || 0}
            icon={Users}
            title="Total Customers"
          />
        </div>

        <MonthlyRevenue data={filteredMonthlyData} />
      </>
    </main>
  );
}
// app/page.tsx
"use client";

import RevenueAnalysis, {
  MonthlyRevenueData,
  SummaryData,
} from "@/components/RevenueAnalysis";
import { useEffect, useState, useCallback } from "react";
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

export default function RevenueAnalysisComponent() {
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenueData[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for selected month range
  const [startMonth, setStartMonth] = useState<SelectOption | null>(null);
  const [endMonth, setEndMonth] = useState<SelectOption | null>(null);

  const [monthOptions, setMonthOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append("merchantId", "1");

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
        if (generatedMonthOptions.length > 0 && !startMonth) {
          setStartMonth(generatedMonthOptions[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed params because that is not needed.

  const getDisabledMonthsForEnd = useCallback((): Set<string> => {
    const disabledMonths = new Set<string>();
    if (startMonth) {
      const startMoment = moment(startMonth.value, "MMM-YYYY");
      monthOptions.forEach((option) => {
        const optionMoment = moment(option.value, "MMM-YYYY");
        if (optionMoment.isBefore(startMoment)) {
          disabledMonths.add(option.value);
        }
      });
    }
    return disabledMonths;
  }, [startMonth, monthOptions]);

  const getDisabledMonthsForStart = useCallback((): Set<string> => {
    const disabledMonths = new Set<string>();
    if (endMonth) {
      const endMoment = moment(endMonth.value, "MMM-YYYY");
      monthOptions.forEach((option) => {
        const optionMoment = moment(option.value, "MMM-YYYY");
        if (optionMoment.isAfter(endMoment)) {
          disabledMonths.add(option.value);
        }
      });
    }
    return disabledMonths;
  }, [endMonth, monthOptions]);

  const disabledEndMonths = getDisabledMonthsForEnd();
  const disabledStartMonths = getDisabledMonthsForStart();

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

  return (
    <>
      <div className="flex flex-wrap gap-4 my-5">
        {/* Start Month Select */}
        <div className="w-full sm:w-auto">
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
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select start month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={disabledStartMonths.has(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* End Month Select */}
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium text-gray-700">
            End Month
          </label>
          <Select
            onValueChange={(value) => {
              const selectedOption =
                monthOptions.find((option) => option.value === value) || null;
              setEndMonth(selectedOption);
            }}
            value={endMonth?.value || ""}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select end month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={disabledEndMonths.has(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <RevenueAnalysis data={filteredMonthlyData} summaryData={summaryData} />
    </>
  );
}
"use client";

import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import moment from 'moment';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { de } from "@faker-js/faker";

export interface MonthlyRevenueData {
  month: string;
  year: string;
  revenue: number;
}

export interface SummaryData {
  totalRevenue: number;
  netProfit: number;
  totalExpenses: number;
  totalPayment: number;
  totalCustomers: string | number;
}

interface MonthlyRevenueProps {
  data: MonthlyRevenueData[];
  summaryData: SummaryData | null;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "black",
  },
} satisfies ChartConfig;

interface SelectOption {
  value: string;
  label: string;
}

export default function RevenueAnalysis({ data, summaryData }: MonthlyRevenueProps) {

  const monthOptions: SelectOption[] = data.map(item => ({
    value: `${item.month}-${item.year}`,  
    label: `${item.month} ${item.year}`,
  }));

  const [startMonth, setStartMonth] = useState<SelectOption | null>(null);
  const [endMonth, setEndMonth] = useState<SelectOption | null>(null);

  const filteredData = data.filter(item => {
    if (!startMonth || !endMonth) return true;  

    const itemMoment = moment(`${item.month} ${item.year}`, 'MMM YYYY');
    const startMoment = moment(startMonth.value, 'MMM-YYYY');
    const endMoment = moment(endMonth.value, 'MMM-YYYY');

    return itemMoment.isSameOrAfter(startMoment) && itemMoment.isSameOrBefore(endMoment);
  });

  const growthData = filteredData.map((item, index) => {
    if (index === 0) {
      return {
        month: item.month,
        year: item.year,
        revenue: item.revenue,
        growth: 0,
      };
    }

    const previousRevenue = filteredData[index - 1].revenue;
    const growth = ((item.revenue - previousRevenue) / previousRevenue) * 100;

    return {
      month: item.month,
      year: item.year,
      revenue: item.revenue,
      growth: Number.parseFloat(growth.toFixed(2)),
    };
  });

  const formatCurrency = (value: number): string => {
    return value.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
    });
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const profitMargin =
    summaryData && summaryData.totalRevenue !== 0
      ? (summaryData.netProfit / summaryData.totalRevenue) * 100
      : 0;

  return (
    <div className="flex flex-col gap-3">

      {/* Month Range Filter */}
      <div className="flex gap-4">
          {/* Start Month Select */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Start Month</label>
            <Select onValueChange={(value) => {
                const selectedOption = monthOptions.find(option => option.value === value) || null;
                setStartMonth(selectedOption);
            }}>
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
            <label className="block text-sm font-medium text-gray-700">End Month</label>
            <Select onValueChange={(value) => {
                const selectedOption = monthOptions.find(option => option.value === value) || null;
                setEndMonth(selectedOption);
            }}>
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

      {/* Revenue Trend Area Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue with trend line</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={filteredData}
              margin={{
                top: 10,
                right: 12,
                left: 12,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Area
                dataKey="revenue"
                type="monotone"
                fill="black"
                fillOpacity={0.4}
                stroke="black"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                Trending up by 5.2% this month
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                January - June 2024
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Month-over-Month Growth Bar Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle>Month-over-Month Growth</CardTitle>
          <CardDescription>Percentage change in revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)}%`, "Growth"]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="growth">
                {growthData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.growth >= 0 ? "#10b981" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {summaryData && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs. Expenses</CardTitle>
            <CardDescription>Profit breakdown analysis</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="mb-4">
              <h3 className="text-center text-sm font-medium">
                Profit Margin: {formatPercentage(profitMargin)}
              </h3>
            </div>
            <div className="flex gap-4 flex-col md:flex-row lg:flex-row">
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium text-muted-foreground">
                  Revenue
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(summaryData.totalRevenue)}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium text-muted-foreground">
                  Expenses
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(summaryData.totalExpenses)}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium text-muted-foreground">
                  Net Profit
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(summaryData.netProfit)}
                </div>
              </div>
            </div>
            <div className="w-full h-8 mt-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${profitMargin}%`,
                }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Profit as percentage of total revenue
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
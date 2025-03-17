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

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

interface SummaryData {
  totalRevenue: number;
  netProfit: number;
  totalExpenses: number;  // Corrected typo: totalExpense -> totalExpenses
  totalPayment: number;  // This isn't used, consider removing if unnecessary
}

interface MonthlyRevenueProps {
  data: MonthlyRevenueData[];
  summaryData: SummaryData;  // Changed to a single object, not an array
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "black",
  },
} satisfies ChartConfig;

export default function RevenueAnalysis({ data, summaryData }: MonthlyRevenueProps) {
  // Ensure that summaryData is not undefined before accessing its properties
  if (!summaryData) {
    return <div>Loading or No Summary Data</div>; // Or a more appropriate message
  }

  const growthData = data.map((item, index) => {
    if (index === 0) {
      return {
        month: item.month,
        revenue: item.revenue,
        growth: 0,
      };
    }

    const previousRevenue = data[index - 1].revenue;
    const growth = ((item.revenue - previousRevenue) / previousRevenue) * 100;

    return {
      month: item.month,
      revenue: item.revenue,
      growth: Number.parseFloat(growth.toFixed(2)),
    };
  });

  // Helper function to format numbers as currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString(undefined, {
      style: "currency",
      currency: "USD", // Or your desired currency code
    });
  };

  // Helper function to format numbers as percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const profitMargin = isFinite(summaryData.netProfit / summaryData.totalRevenue)
    ? (summaryData.netProfit / summaryData.totalRevenue) * 100
    : 0;

  return (
    <div className="flex flex-col gap-3">
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
              data={data}
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
      <div className="flex flex-row flex-wrap md:flex-nowrap lg:flex-nowrap gap-3">

      
      <Card className="w-full">
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

      {/* Revenue vs. Expenses Card */}
      <Card className="w-full flex flex-col justify-between">
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
          <div className="grid grid-cols-3 w-full gap-4 mb-4">
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
          <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
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
      </div>
    </div>
  );
}
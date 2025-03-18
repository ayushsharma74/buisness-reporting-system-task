"use client"

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";


interface MonthlyRevenueData {
    month: string;
    revenue: number;
}

interface MonthlyRevenueProps {
    data: MonthlyRevenueData[];
}

const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export default function MonthlyRevenue({ data }: MonthlyRevenueProps) {
    // Ensure data is an array
    // if (!Array.isArray(data)) {
    //     return <p>Error: Data is not an array.</p>;
    // }
    const firstMonth = data.length > 0 ? data[0].month : 'N/A';
    const lastMonth = data.length > 0 ? data[data.length - 1].month : 'N/A';
    const firstYear = data.length > 0 ? data[0].year : 'N/A';
    const lastYear = data.length > 0 ? data[data.length - 1].year : 'N/A';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>{firstMonth} {firstYear} - {lastMonth} {lastYear}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart data={data} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="revenue" fill="black" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total revenue for the last 6 months
                </div>
            </CardFooter>
        </Card>
    );
}
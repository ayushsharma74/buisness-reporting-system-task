// Add this to make the route dynamic
export const dynamic = 'force-dynamic';

import AnalyticsCard from "@/components/AnalyticsCard";
import MonthlyRevenue from "@/components/MonthlyRevenue";
import RevenueAnalysis from "@/components/RevenueAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndianRupee, ChartLine, CreditCard, Users } from "lucide-react";

export default async function Home() {
  let data, data1;
  
  try {
    // Using relative URLs instead of absolute localhost URLs
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/monthly-growth?merchantId=1`,
      { cache: 'no-store' } // Prevents caching during build
    );
    
    const res1 = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ''}/api/reports/summary?merchantId=1`,
      { cache: 'no-store' } // Prevents caching during build
    );
    
    data = await res.json();
    data1 = await res1.json();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    // Return a fallback UI or error state
  }

  return (
    <main className="flex flex-col gap-3 py-3">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="flex flex-col gap-3">
          {data && data1 ? (
            <>
              <div className="flex gap-4 flex-wrap">
                <AnalyticsCard
                  value={"$" + data1.totalRevenue}
                  icon={IndianRupee}
                  title="Total Revenue"
                />
                <AnalyticsCard
                  value={"$" + data1.netProfit}
                  icon={ChartLine}
                  title="Net Profit"
                />
                <AnalyticsCard
                  value={"$" + data1.totalExpenses}
                  icon={CreditCard}
                  title="Total Expenses"
                />
                <AnalyticsCard
                  value={data1.totalCustomers}
                  icon={Users}
                  title="Total Customers"
                />
              </div>

              <MonthlyRevenue data={data} />
            </>
          ) : (
            <div>Failed to load data or loading...</div>
          )}
        </TabsContent>
        <TabsContent value="revenue">
          {data && data1 ? (
            <RevenueAnalysis data={data} summaryData={data1} />
          ) : (
            <div>Failed to load data or loading...</div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
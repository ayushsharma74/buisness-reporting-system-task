import AnalyticsCard from "@/components/AnalyticsCard";
import MonthlyRevenue from "@/components/MonthlyRevenue";
import  RevenueAnalysis  from "@/components/RevenueAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndianRupee, ChartLine, CreditCard, Users } from "lucide-react";

export default async function Home() {
  const res = await fetch(
    "http://localhost:3000/api/reports/monthly-growth?merchantId=1"
  );
  const res1 = await fetch(
    "http://localhost:3000/api/reports/summary?merchantId=1"
  );
  const data = await res.json();
  const data1 = await res1.json();

  console.log(data);

  return (
    <main className="flex flex-col gap-3 py-3">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="flex flex-col gap-3">
          {data && data1 && (
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
          )}
        </TabsContent>
        <TabsContent value="revenue">
          <RevenueAnalysis data={data} summaryData={data1} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

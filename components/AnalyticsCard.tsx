import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type AnalyticsCardProps = {
  title: string;
  icon: LucideIcon;
  value: string;
}

export default function AnalyticsCard( { title, icon: Icon, value }: AnalyticsCardProps) {
  return (
    <Card className="w-full md:w-1/3 lg:w-1/5 flex grow">
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription><Icon /></CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

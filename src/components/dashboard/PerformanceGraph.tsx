
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface PerformanceData {
  name: string;
  [key: string]: string | number;
}

interface PerformanceGraphProps {
  title: string;
  data: PerformanceData[];
  metrics: {
    key: string;
    label: string;
    color: string;
  }[];
  className?: string;
  timeRanges?: {
    value: string;
    label: string;
  }[];
}

export function PerformanceGraph({
  title,
  data,
  metrics,
  className,
  timeRanges = [
    { value: "1h", label: "Last Hour" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
  ],
}: PerformanceGraphProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(
    timeRanges[2].value
  );
  const isMobile = useIsMobile();

  // In a real app, this would filter data based on the selected time range
  // Here we're just using the same data for demonstration
  const filteredData = data;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-2">
        <CardTitle>{title}</CardTitle>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-[250px] sm:h-[300px]"
          config={metrics.reduce((acc, metric) => {
            acc[metric.key] = {
              theme: { light: metric.color, dark: metric.color },
              label: metric.label,
            };
            return acc;
          }, {} as any)}
        >
          <LineChart
            data={filteredData}
            margin={isMobile ? 
              { top: 5, right: 10, left: 0, bottom: 5 } : 
              { top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              stroke="currentColor"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              tick={isMobile ? { fontSize: 10 } : {}}
              tickFormatter={isMobile ? 
                (value) => value.split(' at ')[1] || value : 
                undefined}
            />
            <YAxis
              stroke="currentColor"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              width={isMobile ? 30 : 40}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend 
              wrapperStyle={isMobile ? { fontSize: '10px' } : {}}
            />
            {metrics.map((metric) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                name={metric.label}
                stroke={`var(--color-${metric.key})`}
                activeDot={{ r: isMobile ? 5 : 8 }}
                strokeWidth={isMobile ? 1.5 : 2}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

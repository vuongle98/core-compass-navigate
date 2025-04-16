
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ActiveUsers } from "@/components/dashboard/ActiveUsers";
import { RecentLoginsWidget } from "@/components/dashboard/RecentLoginsWidget";
import { SystemAlertsWidget } from "@/components/dashboard/SystemAlertsWidget";
import { PerformanceGraph } from "@/components/dashboard/PerformanceGraph";
import { UpcomingEventsWidget } from "@/components/dashboard/UpcomingEventsWidget";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import DashboardService, { DashboardMetric } from "@/services/DashboardService";
import {
  Users,
  Shield,
  Key,
  FileText,
  Bell,
  Settings,
  Flag,
  FileText as FileIcon,
} from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  // Date range state for filtering dashboard data
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });

  // Fetch metrics data
  const { 
    data: metricsData, 
    isLoading: isLoadingMetrics 
  } = useQuery({
    queryKey: ['dashboard-metrics', dateRange],
    queryFn: () => DashboardService.getMetrics(),
    meta: {
      onError: () => {
        toast({
          title: "Error fetching metrics",
          description: "Could not load dashboard metrics. Using cached data.",
          variant: "destructive",
        });
      }
    }
  });

  // Fetch activity data
  const { 
    data: activityData, 
    isLoading: isLoadingActivity 
  } = useQuery({
    queryKey: ['dashboard-activity', dateRange],
    queryFn: () => DashboardService.getActivityData(),
    meta: {
      onError: () => {
        toast({
          title: "Error fetching activity data",
          description: "Could not load activity data. Using cached data.",
          variant: "destructive",
        });
      }
    }
  });

  // Fetch performance data
  const { 
    data: performanceData, 
    isLoading: isLoadingPerformance 
  } = useQuery({
    queryKey: ['dashboard-performance', dateRange],
    queryFn: () => DashboardService.getPerformanceData(),
    meta: {
      onError: () => {
        toast({
          title: "Error fetching performance data",
          description: "Could not load performance data. Using cached data.",
          variant: "destructive",
        });
      }
    }
  });

  // Map metric IDs to their appropriate icons
  const getIconForMetric = (metricId: string) => {
    const iconMap: Record<string, React.ElementType> = {
      users: Users,
      roles: Shield,
      permissions: Key,
      files: FileText,
      notifications: Bell,
      configs: Settings,
      flags: Flag,
      blogs: FileIcon,
    };
    
    return iconMap[metricId] || Settings;
  };

  // Map metrics to their appropriate links
  const getLinkForMetric = (metricId: string) => {
    const linkMap: Record<string, string> = {
      users: '/users',
      roles: '/roles',
      permissions: '/permissions',
      files: '/files',
      notifications: '/notifications',
      configs: '/configuration',
      flags: '/feature-flags',
      blogs: '/blogs',
    };
    
    return linkMap[metricId] || '/';
  };

  const metrics = metricsData?.data || [];
  const userActivity = activityData?.data?.userActivity || [];
  const fileUploads = activityData?.data?.fileUploads || [];
  const notifications = activityData?.data?.notifications || [];
  const systemPerformance = performanceData?.data || [];

  // Mock active users data
  const activeUsers = [
    {
      id: 1,
      name: "Jane Cooper",
      email: "jane@example.com",
      status: "online" as const,
    },
    {
      id: 2,
      name: "Alex Johnson",
      email: "alex@example.com",
      status: "idle" as const,
    },
    {
      id: 3,
      name: "Sam Smith",
      email: "sam@example.com",
      status: "online" as const,
    },
    {
      id: 4,
      name: "Taylor Brown",
      email: "taylor@example.com",
      status: "offline" as const,
      lastActive: "2 hours ago",
    },
    {
      id: 5,
      name: "Morgan Lee",
      email: "morgan@example.com",
      status: "online" as const,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageHeader
          title="Dashboard"
          description="Welcome to the Core Application Dashboard"
          showAddButton={false}
        >
          {/* Date range picker for filtering dashboard data */}
          <div className="w-[300px]">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {isLoadingMetrics ? (
            Array(7).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : (
            metrics.map((metric) => (
              <Link key={metric.id} to={getLinkForMetric(metric.id)} className="block">
                <StatCard
                  title={metric.name}
                  value={metric.value}
                  icon={getIconForMetric(metric.id)}
                  change={metric.change}
                  className="transition-transform hover:scale-105 cursor-pointer"
                />
              </Link>
            ))
          )}
        </div>

        {/* First row of widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <SystemAlertsWidget />
          <RecentLoginsWidget />
          <UpcomingEventsWidget />
        </div>

        {/* Performance graphs row */}
        <div className="mt-6">
          {isLoadingPerformance ? (
            <Skeleton className="h-[350px]" />
          ) : (
            <PerformanceGraph
              title="System Performance"
              data={systemPerformance}
              metrics={[
                { key: "cpu", label: "CPU Usage (%)", color: "#8B5CF6" },
                { key: "memory", label: "Memory Usage (%)", color: "#0EA5E9" },
                { key: "responseTime", label: "Response Time (ms)", color: "#F97316" },
              ]}
            />
          )}
        </div>

        {/* Activity charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {isLoadingActivity ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[250px]" />
            ))
          ) : (
            <>
              <Link to="/users" className="block">
                <ActivityChart
                  title="User Activity (Last 7 Days)"
                  data={userActivity}
                  color="#8B5CF6"
                  className="transition-transform hover:scale-105 cursor-pointer"
                />
              </Link>
              <Link to="/files" className="block">
                <ActivityChart
                  title="File Uploads (Last 7 Days)"
                  data={fileUploads}
                  color="#0EA5E9"
                  className="transition-transform hover:scale-105 cursor-pointer"
                />
              </Link>
              <Link to="/notifications" className="block">
                <ActivityChart
                  title="Notifications (Last 7 Days)"
                  data={notifications}
                  color="#F97316"
                  className="transition-transform hover:scale-105 cursor-pointer"
                />
              </Link>
            </>
          )}
        </div>

        {/* Active users */}
        <div className="mt-6">
          <Link to="/users" className="block">
            <ActiveUsers
              users={activeUsers}
              className="transition-transform hover:scale-105 cursor-pointer"
            />
          </Link>
        </div>

        <div className="mt-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <p className="text-muted-foreground">
              This is your core application dashboard. Use the sidebar
              navigation to explore different modules of the application.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
              <li>Manage users, roles and permissions</li>
              <li>Generate and revoke access tokens</li>
              <li>Upload and organize files</li>
              <li>Configure notifications</li>
              <li>Set application parameters</li>
              <li>Toggle feature flags</li>
              <li>Manage blog posts</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

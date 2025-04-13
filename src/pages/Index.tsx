
import { useState } from "react";
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
import {
  Users,
  Shield,
  Key,
  FileText,
  Bell,
  Settings,
  Flag,
} from "lucide-react";

const Index = () => {
  // Date range state for filtering dashboard data
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });

  // Mock data for dashboard metrics
  const stats = [
    {
      title: "Total Users",
      value: 2458,
      icon: Users,
      change: 12.5,
      link: "/users",
    },
    { title: "Roles", value: 14, icon: Shield, change: 0, link: "/roles" },
    {
      title: "Permissions",
      value: 42,
      icon: Key,
      change: 4.2,
      link: "/permissions",
    },
    {
      title: "Files",
      value: 321,
      icon: FileText,
      change: -2.3,
      link: "/files",
    },
    {
      title: "Notifications",
      value: 68,
      icon: Bell,
      change: 8.1,
      link: "/notifications",
    },
    {
      title: "Config Params",
      value: 35,
      icon: Settings,
      change: 1.5,
      link: "/configuration",
    },
    {
      title: "Feature Flags",
      value: 24,
      icon: Flag,
      change: 5.2,
      link: "/feature-flags",
    },
  ];

  // Mock activity data for the charts
  const userActivityData = [
    { name: "Mon", value: 124 },
    { name: "Tue", value: 158 },
    { name: "Wed", value: 187 },
    { name: "Thu", value: 145 },
    { name: "Fri", value: 260 },
    { name: "Sat", value: 112 },
    { name: "Sun", value: 97 },
  ];

  const fileUploadsData = [
    { name: "Mon", value: 12 },
    { name: "Tue", value: 15 },
    { name: "Wed", value: 8 },
    { name: "Thu", value: 22 },
    { name: "Fri", value: 16 },
    { name: "Sat", value: 5 },
    { name: "Sun", value: 3 },
  ];

  const notificationsData = [
    { name: "Mon", value: 100 },
    { name: "Tue", value: 221 },
    { name: "Wed", value: 124 },
    { name: "Thu", value: 993 },
    { name: "Fri", value: 102 },
    { name: "Sat", value: 912 },
    { name: "Sun", value: 783 },
  ];

  // Performance metrics data
  const performanceData = [
    { name: "00:00", cpu: 42, memory: 65, responseTime: 120 },
    { name: "04:00", cpu: 28, memory: 59, responseTime: 100 },
    { name: "08:00", cpu: 55, memory: 70, responseTime: 150 },
    { name: "12:00", cpu: 90, memory: 85, responseTime: 200 },
    { name: "16:00", cpu: 85, memory: 82, responseTime: 180 },
    { name: "20:00", cpu: 70, memory: 75, responseTime: 160 },
    { name: "24:00", cpu: 45, memory: 68, responseTime: 130 },
  ];

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
          {stats.map((stat) => (
            <Link key={stat.title} to={stat.link} className="block">
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                change={stat.change}
                className="transition-transform hover:scale-105 cursor-pointer"
              />
            </Link>
          ))}
        </div>

        {/* First row of widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <SystemAlertsWidget />
          <RecentLoginsWidget />
          <UpcomingEventsWidget />
        </div>

        {/* Performance graphs row */}
        <div className="mt-6">
          <PerformanceGraph
            title="System Performance"
            data={performanceData}
            metrics={[
              { key: "cpu", label: "CPU Usage (%)", color: "#8B5CF6" },
              { key: "memory", label: "Memory Usage (%)", color: "#0EA5E9" },
              { key: "responseTime", label: "Response Time (ms)", color: "#F97316" },
            ]}
          />
        </div>

        {/* Activity charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Link to="/users" className="block">
            <ActivityChart
              title="User Activity (Last 7 Days)"
              data={userActivityData}
              color="#8B5CF6"
              className="transition-transform hover:scale-105 cursor-pointer"
            />
          </Link>
          <Link to="/files" className="block">
            <ActivityChart
              title="File Uploads (Last 7 Days)"
              data={fileUploadsData}
              color="#0EA5E9"
              className="transition-transform hover:scale-105 cursor-pointer"
            />
          </Link>
          <Link to="/notifications" className="block">
            <ActivityChart
              title="Notifications (Last 7 Days)"
              data={notificationsData}
              color="#F97316"
              className="transition-transform hover:scale-105 cursor-pointer"
            />
          </Link>
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
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

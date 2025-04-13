import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ActiveUsers } from "@/components/dashboard/ActiveUsers";
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

  const nitificationsData = [
    { name: "Mon", value: 100 },
    { name: "Tue", value: 221 },
    { name: "Wed", value: 124 },
    { name: "Thu", value: 993 },
    { name: "Fri", value: 102 },
    { name: "Sat", value: 912 },
    { name: "Sun", value: 783 },
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
        />

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          <Link to="/users" className="col-span-2 block">
            <ActivityChart
              title="User Activity (Last 7 Days)"
              data={userActivityData}
              color="#8B5CF6"
              className="transition-transform hover:scale-105 cursor-pointer"
            />
          </Link>
          <Link to="/files" className="col-span-2 block">
            <ActivityChart
              title="File Uploads (Last 7 Days)"
              data={fileUploadsData}
              color="#0EA5E9"
              className="transition-transform hover:scale-105 cursor-pointer"
            />
          </Link>
          <Link to="/notifications" className="col-span-2 block">
            <ActivityChart
              title="Notifications (Last 7 Days)"
              data={nitificationsData}
              color="#OACEF9"
              className="transition-transform hover:scale-105 cursor-pointer"
            />
          </Link>
          <Link to="/users" className="col-span-2 block">
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

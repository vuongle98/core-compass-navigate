import { DateRange } from "react-day-picker";

export interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  change: number;
}

export interface ActivityData {
  date: string;
  count: number;
  name: string; // For compatibility with charts
  value: number; // For compatibility with charts
}

export interface PerformanceData {
  timestamp: string;
  cpu: number;
  memory: number;
  responseTime: number;
  name: string; // For compatibility with PerformanceGraph
  [key: string]: string | number; // Index signature for compatibility
}

class DashboardService {
  /**
   * Get dashboard metrics data
   */
  static async getMetrics(): Promise<DashboardMetric[]> {
    // This would be an API call in a real application
    return [
      {
        id: "users",
        name: "Users",
        value: 1254,
        change: 12.5,
      },
      {
        id: "roles",
        name: "Roles",
        value: 8,
        change: 0,
      },
      {
        id: "permissions",
        name: "Permissions",
        value: 32,
        change: 3.1,
      },
      {
        id: "files",
        name: "Files",
        value: 276,
        change: 5.4,
      },
      {
        id: "notifications",
        name: "Notifications",
        value: 164,
        change: 42.1,
      },
      {
        id: "configs",
        name: "Configuration",
        value: 24,
        change: 0,
      },
      {
        id: "flags",
        name: "Feature Flags",
        value: 12,
        change: -8.3,
      },
      {
        id: "blogs",
        name: "Blog Posts",
        value: 63,
        change: 12.7,
      },
    ];
  }

  /**
   * Get activity data for charts
   */
  static async getActivityData(): Promise<{
    userActivity: ActivityData[];
    fileUploads: ActivityData[];
    notifications: ActivityData[];
  }> {
    // In a real app, this would be an API call
    const today = new Date();
    const userActivity = Array(7)
      .fill(0)
      .map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split("T")[0],
          count: Math.floor(Math.random() * 50) + 10,
          name: "User Activity",
          value: Math.floor(Math.random() * 50) + 10,
        };
      });

    const fileUploads = Array(7)
      .fill(0)
      .map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split("T")[0],
          count: Math.floor(Math.random() * 20) + 5,
          name: "File Uploads",
          value: Math.floor(Math.random() * 20) + 5,
        };
      });

    const notifications = Array(7)
      .fill(0)
      .map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split("T")[0],
          count: Math.floor(Math.random() * 30) + 15,
          name: "Notifications",
          value: Math.floor(Math.random() * 30) + 15,
        };
      });

    return {
      userActivity,
      fileUploads,
      notifications,
    };
  }

  /**
   * Get system performance data
   */
  static async getPerformanceData(): Promise<PerformanceData[]> {
    // In a real app, this would be an API call
    const today = new Date();
    return Array(24)
      .fill(0)
      .map((_, i) => {
        const date = new Date(today);
        date.setHours(date.getHours() - (23 - i));
        return {
          timestamp: date.toISOString(),
          cpu: Math.floor(Math.random() * 60) + 20,
          memory: Math.floor(Math.random() * 50) + 30,
          responseTime: Math.floor(Math.random() * 300) + 50,
          name: `Performance at ${date.getHours()}:00`,
        };
      });
  }
}

export default DashboardService;

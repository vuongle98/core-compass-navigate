
import EnhancedApiService, { ApiResponse } from './EnhancedApiService';
import LoggingService from './LoggingService';

export interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  icon?: string;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  userActivity: { name: string; value: number }[];
  fileUploads: { name: string; value: number }[];
  notifications: { name: string; value: number }[];
  performance: { name: string; cpu: number; memory: number; responseTime: number }[];
}

class DashboardService {
  
  async getMetrics(): Promise<ApiResponse<DashboardMetric[]>> {
    try {
      return await EnhancedApiService.get<DashboardMetric[]>(
        '/api/dashboard/metrics',
        {},
        // Fallback mock data
        [
          { id: 'users', name: 'Total Users', value: 2458, change: 12.5 },
          { id: 'roles', name: 'Roles', value: 14, change: 0 },
          { id: 'permissions', name: 'Permissions', value: 42, change: 4.2 },
          { id: 'files', name: 'Files', value: 321, change: -2.3 },
          { id: 'notifications', name: 'Notifications', value: 68, change: 8.1 },
          { id: 'configs', name: 'Config Params', value: 35, change: 1.5 },
          { id: 'flags', name: 'Feature Flags', value: 24, change: 5.2 }
        ]
      );
    } catch (error) {
      LoggingService.error(
        "dashboard", 
        "fetch_metrics_failed", 
        "Failed to fetch dashboard metrics", 
        { error }
      );
      throw error;
    }
  }

  async getActivityData(): Promise<ApiResponse<{
    userActivity: { name: string; value: number }[];
    fileUploads: { name: string; value: number }[];
    notifications: { name: string; value: number }[];
  }>> {
    try {
      return await EnhancedApiService.get(
        '/api/dashboard/activity',
        {},
        // Fallback mock data
        {
          userActivity: [
            { name: 'Mon', value: 124 }, { name: 'Tue', value: 158 },
            { name: 'Wed', value: 187 }, { name: 'Thu', value: 145 },
            { name: 'Fri', value: 260 }, { name: 'Sat', value: 112 },
            { name: 'Sun', value: 97 }
          ],
          fileUploads: [
            { name: 'Mon', value: 12 }, { name: 'Tue', value: 15 },
            { name: 'Wed', value: 8 }, { name: 'Thu', value: 22 },
            { name: 'Fri', value: 16 }, { name: 'Sat', value: 5 },
            { name: 'Sun', value: 3 }
          ],
          notifications: [
            { name: 'Mon', value: 100 }, { name: 'Tue', value: 221 },
            { name: 'Wed', value: 124 }, { name: 'Thu', value: 993 },
            { name: 'Fri', value: 102 }, { name: 'Sat', value: 912 },
            { name: 'Sun', value: 783 }
          ]
        }
      );
    } catch (error) {
      LoggingService.error(
        "dashboard", 
        "fetch_activity_failed", 
        "Failed to fetch dashboard activity data", 
        { error }
      );
      throw error;
    }
  }

  async getPerformanceData(): Promise<ApiResponse<{ name: string; cpu: number; memory: number; responseTime: number }[]>> {
    try {
      return await EnhancedApiService.get(
        '/api/dashboard/performance',
        {},
        // Fallback mock data
        [
          { name: '00:00', cpu: 42, memory: 65, responseTime: 120 },
          { name: '04:00', cpu: 28, memory: 59, responseTime: 100 },
          { name: '08:00', cpu: 55, memory: 70, responseTime: 150 },
          { name: '12:00', cpu: 90, memory: 85, responseTime: 200 },
          { name: '16:00', cpu: 85, memory: 82, responseTime: 180 },
          { name: '20:00', cpu: 70, memory: 75, responseTime: 160 },
          { name: '24:00', cpu: 45, memory: 68, responseTime: 130 }
        ]
      );
    } catch (error) {
      LoggingService.error(
        "dashboard", 
        "fetch_performance_failed", 
        "Failed to fetch performance data", 
        { error }
      );
      throw error;
    }
  }
}

export default new DashboardService();

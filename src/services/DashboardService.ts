
import EnhancedApiService from './EnhancedApiService';

export interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  change: number;
}

interface SystemStatus {
  name: string;
  cpu: number;
  memory: number;
  responseTime: number;
}

class DashboardService {
  /**
   * Get dashboard metrics
   */
  public async getMetrics(): Promise<DashboardMetric[]> {
    try {
      // Using ApiResponse format for consistency
      const response = await EnhancedApiService.get<{ data: DashboardMetric[], success: boolean }>('/api/dashboard/metrics');
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      // Return mock data for development
      return [
        { id: 'users', name: 'Active Users', value: 2456, change: 12.5 },
        { id: 'revenue', name: 'Revenue', value: 8790, change: -2.7 },
        { id: 'conversion', name: 'Conversion Rate', value: 4.5, change: 1.2 },
        { id: 'sessions', name: 'Sessions', value: 12503, change: 8.1 }
      ];
    }
  }
  
  /**
   * Get activity data for dashboard chart
   */
  public async getActivityData(): Promise<any[]> {
    try {
      const response = await EnhancedApiService.get<{ data: any[], success: boolean }>('/api/dashboard/activity');
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
      // Return mock data for development
      return [
        { date: '2023-01-01', users: 120, sessions: 250, pageViews: 1200 },
        { date: '2023-01-02', users: 132, sessions: 280, pageViews: 1350 },
        { date: '2023-01-03', users: 141, sessions: 300, pageViews: 1450 },
        { date: '2023-01-04', users: 135, sessions: 270, pageViews: 1320 },
        { date: '2023-01-05', users: 152, sessions: 310, pageViews: 1500 },
        { date: '2023-01-06', users: 165, sessions: 340, pageViews: 1650 },
        { date: '2023-01-07', users: 172, sessions: 350, pageViews: 1700 },
      ];
    }
  }

  /**
   * Get performance data
   */
  public async getPerformanceData(): Promise<any[]> {
    try {
      const response = await EnhancedApiService.get<{ data: any[], success: boolean }>('/api/dashboard/performance');
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      // Return mock data
      return [
        { name: 'Jan', cpu: 30, memory: 45, network: 27 },
        { name: 'Feb', cpu: 35, memory: 50, network: 32 },
        { name: 'Mar', cpu: 25, memory: 35, network: 20 },
        { name: 'Apr', cpu: 40, memory: 55, network: 45 },
        { name: 'May', cpu: 45, memory: 60, network: 50 },
        { name: 'Jun', cpu: 50, memory: 65, network: 55 },
      ];
    }
  }
  
  /**
   * Get user activity data
   */
  public async getUserActivity(): Promise<any[]> {
    try {
      const response = await EnhancedApiService.get<{ data: any[], success: boolean }>('/api/dashboard/user-activity');
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      // Return mock data
      return [
        { username: 'alice', lastAction: 'Login', timestamp: '2023-01-07T12:34:56Z' },
        { username: 'bob', lastAction: 'Updated profile', timestamp: '2023-01-07T11:22:33Z' },
        { username: 'charlie', lastAction: 'Created post', timestamp: '2023-01-07T10:45:12Z' },
        { username: 'dave', lastAction: 'Commented', timestamp: '2023-01-07T09:15:00Z' },
        { username: 'eve', lastAction: 'Login', timestamp: '2023-01-07T08:30:45Z' },
      ];
    }
  }
  
  /**
   * Get system status
   */
  public async getSystemStatus(): Promise<SystemStatus[]> {
    try {
      const response = await EnhancedApiService.get<{ data: SystemStatus[], success: boolean }>('/api/dashboard/system-status');
      return response?.data || [];
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      // Return mock data
      return [
        { name: 'API Server', cpu: 45, memory: 62, responseTime: 120 },
        { name: 'Database', cpu: 38, memory: 75, responseTime: 85 },
        { name: 'Auth Service', cpu: 12, memory: 40, responseTime: 65 },
        { name: 'Storage', cpu: 22, memory: 55, responseTime: 30 },
      ];
    }
  }
}

export default new DashboardService();

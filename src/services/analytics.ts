import { apiService } from './api';

export interface DashboardAnalytics {
  total_users: number;
  total_subscription_sales: number;
  total_predefined_labels: number;
  total_predefined_templates: number;
  active_users?: number;
  suspended_users?: number;
  deleted_users?: number;
}

export interface DashboardResponse {
  success: boolean;
  result: {
    message: string;
    analytics: DashboardAnalytics;
  };
}

class AnalyticsService {
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
      const response = await apiService.get<DashboardResponse>('/api/admin/dashboard');
      
      console.log('Dashboard API Response:', response);
      
      if (response.success && response.result?.analytics) {
        return response.result.analytics;
      }
      
      // If response structure is different, try to extract analytics directly
      if ((response as any).analytics) {
        return (response as any).analytics;
      }
      
      throw {
        message: 'Invalid response format: analytics data not found',
      };
    } catch (error) {
      console.error('Dashboard Analytics Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw {
        message: 'Failed to fetch dashboard analytics',
      };
    }
  }
}

export const analyticsService = new AnalyticsService();

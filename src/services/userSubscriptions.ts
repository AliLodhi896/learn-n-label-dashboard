import { apiService } from './api';
import { User, SubscriptionPlan } from './users';

export interface UserSubscription {
  _id?: string;
  id?: string;
  user_id?: string | User;
  plan_id?: string | SubscriptionPlan;
  subscription_type?: 'trial' | 'monthly' | 'yearly' | 'lifetime';
  status?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  is_trial_used?: boolean;
  has_active_subscription?: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
  plan?: SubscriptionPlan;
  [key: string]: any;
}

export interface UserSubscriptionsResponse {
  success?: boolean;
  message?: string;
  subscriptions?: UserSubscription[];
  result?: {
    subscriptions?: UserSubscription[];
    total?: number;
  };
  data?: UserSubscription[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubscriptionAnalytics {
  totalSubscriptions?: number;
  activeSubscriptions?: number;
  totalRevenue?: number;
  monthlySubscriptions?: number;
  yearlySubscriptions?: number;
  lifetimeSubscriptions?: number;
  trialSubscriptions?: number;
}

class UserSubscriptionsService {
  async getAllUserSubscriptions(): Promise<UserSubscription[]> {
    try {
      const response = await apiService.get<UserSubscriptionsResponse>('/api/admin/user-subscriptions');
      console.log('User Subscriptions API Response:', response);
      
      let subscriptions: UserSubscription[] = [];
      
      // Handle different response structures
      if ((response as any).subscriptions && Array.isArray((response as any).subscriptions)) {
        subscriptions = (response as any).subscriptions;
      } else if (response.success && response.result?.subscriptions) {
        subscriptions = response.result.subscriptions;
      } else if (response.data && Array.isArray(response.data)) {
        subscriptions = response.data;
      } else if (Array.isArray(response)) {
        subscriptions = response;
      }
      
      // Map subscriptions to ensure they have both _id and id for compatibility
      return subscriptions.map((subscription) => ({
        ...subscription,
        _id: subscription.id || subscription._id,
        id: subscription.id || subscription._id || String(Math.random()),
      }));
    } catch (error) {
      console.error('Get User Subscriptions Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to fetch user subscriptions');
    }
  }

  async getUserSubscription(userId: string): Promise<UserSubscription> {
    try {
      const response = await apiService.get<UserSubscriptionsResponse>(`/api/admin/user-subscriptions/${userId}`);
      console.log('Get User Subscription API Response:', response);
      
      let subscription: UserSubscription | null = null;
      
      // Handle different response structures
      if ((response as any).subscription) {
        subscription = (response as any).subscription;
      } else if (response.success && response.result) {
        if ((response.result as any).subscription) {
          subscription = (response.result as any).subscription;
        } else if (typeof response.result === 'object' && !Array.isArray(response.result)) {
          subscription = response.result as any;
        }
      } else if ((response as any).subscriptions && Array.isArray((response as any).subscriptions) && (response as any).subscriptions.length > 0) {
        subscription = (response as any).subscriptions[0];
      }
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      return {
        ...subscription,
        _id: subscription.id || subscription._id || userId,
        id: subscription.id || subscription._id || userId,
      };
    } catch (error) {
      console.error('Get User Subscription Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to fetch user subscription');
    }
  }

  async assignSubscriptionToUser(
    userId: string,
    data: { plan_id: string; subscription_type: string; subscription_start_date?: string; subscription_end_date?: string }
  ): Promise<UserSubscription> {
    try {
      const response = await apiService.post<UserSubscriptionsResponse>(
        `/api/admin/user-subscriptions/${userId}/assign`,
        data
      );
      console.log('Assign Subscription API Response:', response);
      
      let subscription: UserSubscription | null = null;
      
      // Handle different response structures
      if ((response as any).subscription) {
        subscription = (response as any).subscription;
      } else if (response.success && response.result) {
        if ((response.result as any).subscription) {
          subscription = (response.result as any).subscription;
        } else if (typeof response.result === 'object' && !Array.isArray(response.result)) {
          subscription = response.result as any;
        }
      } else if ((response as any).subscriptions && Array.isArray((response as any).subscriptions) && (response as any).subscriptions.length > 0) {
        subscription = (response as any).subscriptions[0];
      }
      
      if (!subscription) {
        throw new Error('Invalid response format: subscription data not found');
      }
      
      return {
        ...subscription,
        _id: subscription.id || subscription._id,
        id: subscription.id || subscription._id || String(Math.random()),
      };
    } catch (error) {
      console.error('Assign Subscription Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to assign subscription');
    }
  }

  async getSubscriptionAnalytics(): Promise<SubscriptionAnalytics> {
    try {
      const subscriptions = await this.getAllUserSubscriptions();
      
      // Filter out trial subscriptions for analytics
      const paidSubscriptions = subscriptions.filter(
        (sub) => sub.subscription_type?.toLowerCase() !== 'trial'
      );
      
      const activeSubscriptions = paidSubscriptions.filter(
        (sub) => sub.has_active_subscription || sub.status?.toLowerCase() === 'active'
      );
      
      // Calculate analytics
      const analytics: SubscriptionAnalytics = {
        totalSubscriptions: paidSubscriptions.length,
        activeSubscriptions: activeSubscriptions.length,
        monthlySubscriptions: paidSubscriptions.filter(
          (sub) => sub.subscription_type?.toLowerCase() === 'monthly'
        ).length,
        yearlySubscriptions: paidSubscriptions.filter(
          (sub) => sub.subscription_type?.toLowerCase() === 'yearly'
        ).length,
        lifetimeSubscriptions: paidSubscriptions.filter(
          (sub) => sub.subscription_type?.toLowerCase() === 'lifetime'
        ).length,
        trialSubscriptions: subscriptions.filter(
          (sub) => sub.subscription_type?.toLowerCase() === 'trial'
        ).length,
      };
      
      // Calculate total revenue (if plan prices are available)
      let totalRevenue = 0;
      paidSubscriptions.forEach((sub) => {
        const plan = sub.plan || (sub.plan_id as SubscriptionPlan);
        if (plan && typeof plan === 'object' && plan.price) {
          totalRevenue += plan.price;
        }
      });
      analytics.totalRevenue = totalRevenue;
      
      return analytics;
    } catch (error) {
      console.error('Get Subscription Analytics Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to fetch subscription analytics');
    }
  }
}

export const userSubscriptionsService = new UserSubscriptionsService();

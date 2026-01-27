import { apiService } from './api';

export interface SubscriptionPlan {
  id?: string;
  plan_id?: string;
  plan_name?: string;
  description?: string;
  price?: number;
  currency?: string;
  duration_days?: number;
  features?: string[];
}

export interface UserSubscription {
  id?: string;
  subscription_type?: string;
  status?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  is_trial_used?: boolean;
  has_active_subscription?: boolean;
  plan?: SubscriptionPlan | null;
}

export interface User {
  _id: string;
  id?: string;
  email: string;
  name?: string;
  role?: string;
  status?: 'active' | 'suspended' | 'deleted';
  is_deleted?: boolean;
  deleted_at?: string | null;
  profile_image?: string;
  is_approved?: boolean;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  subscription?: UserSubscription | null;
  has_active_subscription?: boolean;
  [key: string]: any;
}

export interface UsersResponse {
  success?: boolean;
  result?: {
    users?: User[];
    total?: number;
  };
  users?: User[];
  data?: User[];
}

class UsersService {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiService.get<UsersResponse>('/api/admin/users');
      
      let users: User[] = [];
      
      if (response.success && response.result?.users) {
        users = response.result.users;
      } else if ((response as any).users) {
        users = (response as any).users;
      } else if (Array.isArray(response)) {
        users = response;
      } else if (response.result && Array.isArray(response.result)) {
        users = response.result;
      }
      
      // Map users to ensure they have both _id and id for compatibility
      return users.map((user) => ({
        ...user,
        id: user._id || user.id, // Use _id as id for DataGrid compatibility
      }));
    } catch (error) {
      console.error('Get Users Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to fetch users');
    }
  }

  async suspendUser(userId: string): Promise<void> {
    try {
      await apiService.put(`/api/admin/users/${userId}/suspend`);
    } catch (error) {
      console.error('Suspend User Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to suspend user');
    }
  }

  async unsuspendUser(userId: string): Promise<void> {
    try {
      await apiService.put(`/api/admin/users/${userId}/unsuspend`);
    } catch (error) {
      console.error('Unsuspend User Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to unsuspend user');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await apiService.delete(`/api/admin/users/${userId}`);
    } catch (error) {
      console.error('Delete User Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to delete user');
    }
  }

  async createUser(data: { name?: string; email: string; password: string; address?: string }): Promise<User> {
    try {
      const response = await apiService.post<UsersResponse>('/api/auth/register', data);
      console.log('Create User API Response:', response);
      
      let createdUser: User | null = null;
      
      // Handle different response structures
      if ((response as any).user) {
        createdUser = (response as any).user;
      } else if (response.success && response.result) {
        if ((response.result as any).user) {
          createdUser = (response.result as any).user;
        } else if (typeof response.result === 'object' && !Array.isArray(response.result)) {
          createdUser = response.result as any;
        }
      } else if ((response as any).users && Array.isArray((response as any).users) && (response as any).users.length > 0) {
        createdUser = (response as any).users[0];
      }
      
      if (!createdUser) {
        throw new Error('Invalid response format: user data not found');
      }
      
      return {
        ...createdUser,
        _id: createdUser.id || createdUser._id || String(Math.random()),
        id: createdUser.id || createdUser._id || String(Math.random()),
      };
    } catch (error) {
      console.error('Create User Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }
}

export const usersService = new UsersService();

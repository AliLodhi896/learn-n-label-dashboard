import { apiService } from './api';

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
}

export const usersService = new UsersService();

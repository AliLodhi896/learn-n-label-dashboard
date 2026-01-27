import { apiService } from './api';

export interface Notification {
  _id?: string;
  id?: string;
  user_id?: string | any;
  sender_id?: string | any;
  label_id?: string | any;
  newsletter_id?: string | any;
  type?: 'label' | 'newsletter' | string;
  title?: string;
  message?: string;
  is_read?: boolean;
  read_at?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    profile_image?: string;
    role?: string;
    status?: string;
  } | null;
  sender?: {
    id?: string;
    name?: string;
    email?: string;
    profile_image?: string;
    role?: string;
  } | null;
  label?: {
    id?: string;
    label_name?: string;
    type?: string;
    labels?: any;
    user_id?: string;
    label_image?: string;
    [key: string]: any;
  } | null;
  newsletter?: {
    id?: string;
    title?: string;
    subject?: string;
    content?: string;
    [key: string]: any;
  } | null;
  [key: string]: any;
}

export interface NotificationsResponse {
  success?: boolean;
  message?: string;
  notifications?: Notification[];
  notification?: Notification;
  result?: {
    notifications?: Notification[];
    notification?: Notification;
    total?: number;
  };
  data?: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class NotificationsService {
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const response = await apiService.get<NotificationsResponse>('/api/admin/notifications');
      console.log('Notifications API Response:', response);
      
      let notifications: Notification[] = [];
      
      // Handle different response structures
      if ((response as any).notifications && Array.isArray((response as any).notifications)) {
        notifications = (response as any).notifications;
      } else if (response.success && response.result?.notifications) {
        notifications = response.result.notifications;
      } else if (response.data && Array.isArray(response.data)) {
        notifications = response.data;
      } else if (Array.isArray(response)) {
        notifications = response;
      }
      
      // Map notifications to ensure they have both _id and id for compatibility
      return notifications.map((notification) => ({
        ...notification,
        _id: notification.id || notification._id,
        id: notification.id || notification._id || String(Math.random()),
      }));
    } catch (error) {
      console.error('Get Notifications Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to fetch notifications');
    }
  }

  async getNotificationById(notificationId: string): Promise<Notification> {
    try {
      const response = await apiService.get<NotificationsResponse>(`/api/admin/notifications/${notificationId}`);
      console.log('Get Notification by ID API Response:', response);
      
      let notification: Notification | null = null;
      
      // Handle different response structures
      if ((response as any).notification) {
        notification = (response as any).notification;
      } else if (response.success && response.result) {
        if ((response.result as any).notification) {
          notification = (response.result as any).notification;
        } else if (typeof response.result === 'object' && !Array.isArray(response.result)) {
          notification = response.result as any;
        }
      } else if ((response as any).notifications && Array.isArray((response as any).notifications) && (response as any).notifications.length > 0) {
        notification = (response as any).notifications[0];
      }
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      return {
        ...notification,
        _id: notification.id || notification._id || notificationId,
        id: notification.id || notification._id || notificationId,
      };
    } catch (error) {
      console.error('Get Notification by ID Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to fetch notification');
    }
  }
}

export const notificationsService = new NotificationsService();

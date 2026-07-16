import { apiService } from './api';

export interface MaintenanceAllowedUser {
  id: string;
  name: string;
  email: string;
}

export interface MaintenanceSettings {
  id?: string;
  enabled: boolean;
  is_active?: boolean;
  reason: string;
  ends_at: string | null;
  allowed_user_ids: string[];
  allowed_users?: MaintenanceAllowedUser[];
  last_updated_by?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateMaintenancePayload {
  enabled: boolean;
  reason: string;
  ends_at: string | null;
  allowed_user_ids: string[];
}

class MaintenanceService {
  async getMaintenance(): Promise<MaintenanceSettings> {
    const response = await apiService.get<{
      success?: boolean;
      result?: { maintenance?: MaintenanceSettings };
      maintenance?: MaintenanceSettings;
    }>('/api/admin/maintenance');

    const maintenance =
      response.result?.maintenance ||
      (response as any).maintenance ||
      null;

    if (!maintenance) {
      throw new Error('Failed to load maintenance settings');
    }

    return {
      enabled: Boolean(maintenance.enabled),
      is_active: Boolean(maintenance.is_active),
      reason: maintenance.reason || '',
      ends_at: maintenance.ends_at || null,
      allowed_user_ids: Array.isArray(maintenance.allowed_user_ids)
        ? maintenance.allowed_user_ids.map(String)
        : [],
      allowed_users: maintenance.allowed_users || [],
      last_updated_by: maintenance.last_updated_by || null,
      id: maintenance.id,
      createdAt: maintenance.createdAt,
      updatedAt: maintenance.updatedAt,
    };
  }

  async updateMaintenance(
    payload: UpdateMaintenancePayload
  ): Promise<MaintenanceSettings> {
    const response = await apiService.put<{
      success?: boolean;
      result?: { maintenance?: MaintenanceSettings };
      maintenance?: MaintenanceSettings;
    }>('/api/admin/maintenance', payload);

    const maintenance =
      response.result?.maintenance ||
      (response as any).maintenance ||
      null;

    if (!maintenance) {
      throw new Error('Failed to update maintenance settings');
    }

    return {
      enabled: Boolean(maintenance.enabled),
      is_active: Boolean(maintenance.is_active),
      reason: maintenance.reason || '',
      ends_at: maintenance.ends_at || null,
      allowed_user_ids: Array.isArray(maintenance.allowed_user_ids)
        ? maintenance.allowed_user_ids.map(String)
        : [],
      allowed_users: maintenance.allowed_users || [],
      last_updated_by: maintenance.last_updated_by || null,
      id: maintenance.id,
      createdAt: maintenance.createdAt,
      updatedAt: maintenance.updatedAt,
    };
  }
}

export const maintenanceService = new MaintenanceService();

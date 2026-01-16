import { apiService } from './api';

export type SettingType = 'privacy_policy' | 'about_us' | 'terms_and_conditions';

export interface Setting {
  _id?: string;
  id?: string;
  type: SettingType;
  title: string;
  content: string;
  last_updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface SettingsResponse {
  success?: boolean;
  message?: string;
  settings?: Setting[];
  setting?: Setting;
  result?: {
    settings?: Setting[];
    setting?: Setting;
  };
  data?: Setting[];
}

class SettingsService {
  async getAllSettings(): Promise<Setting[]> {
    try {
      const response = await apiService.get<SettingsResponse>('/api/admin/settings');
      console.log('Settings API Response:', response);
      
      let settings: Setting[] = [];
      
      if ((response as any).settings && Array.isArray((response as any).settings)) {
        settings = (response as any).settings;
      } else if (response.success && response.result?.settings) {
        settings = response.result.settings;
      } else if (response.settings) {
        settings = response.settings;
      } else if (Array.isArray(response)) {
        settings = response;
      } else if (response.result && Array.isArray(response.result)) {
        settings = response.result;
      }
      
      return settings.map((setting) => ({
        ...setting,
        _id: setting.id || setting._id,
        id: setting.id || setting._id || String(Math.random()),
      }));
    } catch (error) {
      console.error('Get Settings Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to fetch settings');
    }
  }

  async getSettingByType(type: SettingType): Promise<Setting | null> {
    try {
      const response = await apiService.get<SettingsResponse>(`/api/admin/settings/${type}`);
      console.log('Setting by Type API Response:', response);
      
      let setting: Setting | null = null;
      
      if ((response as any).setting) {
        setting = (response as any).setting;
      } else if (response.success && response.result?.setting) {
        setting = response.result.setting;
      } else if (response.setting) {
        setting = response.setting;
      } else if (response.result && !Array.isArray(response.result)) {
        setting = response.result as Setting;
      }
      
      if (setting) {
        return {
          ...setting,
          _id: setting.id || setting._id,
          id: setting.id || setting._id || String(Math.random()),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Get Setting by Type Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to fetch setting');
    }
  }

  async createSetting(setting: { type: SettingType; title: string; content: string }): Promise<Setting> {
    try {
      const response = await apiService.post<SettingsResponse>('/api/admin/settings', setting);
      
      let createdSetting: Setting | null = null;
      
      if ((response as any).setting) {
        createdSetting = (response as any).setting;
      } else if (response.success && response.result?.setting) {
        createdSetting = response.result.setting;
      } else if (response.setting) {
        createdSetting = response.setting;
      }
      
      if (!createdSetting) {
        throw new Error('Invalid response format: setting data not found');
      }
      
      return {
        ...createdSetting,
        _id: createdSetting.id || createdSetting._id,
        id: createdSetting.id || createdSetting._id || String(Math.random()),
      };
    } catch (error) {
      console.error('Create Setting Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to create setting');
    }
  }

  async updateSetting(type: SettingType, setting: { title: string; content: string }): Promise<Setting> {
    try {
      const response = await apiService.put<SettingsResponse>(`/api/admin/settings/${type}`, setting);
      
      let updatedSetting: Setting | null = null;
      
      if ((response as any).setting) {
        updatedSetting = (response as any).setting;
      } else if (response.success && response.result?.setting) {
        updatedSetting = response.result.setting;
      } else if (response.setting) {
        updatedSetting = response.setting;
      }
      
      if (!updatedSetting) {
        throw new Error('Invalid response format: setting data not found');
      }
      
      return {
        ...updatedSetting,
        _id: updatedSetting.id || updatedSetting._id,
        id: updatedSetting.id || updatedSetting._id || String(Math.random()),
      };
    } catch (error) {
      console.error('Update Setting Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to update setting');
    }
  }

  async deleteSetting(type: SettingType): Promise<void> {
    try {
      await apiService.delete(`/api/admin/settings/${type}`);
    } catch (error) {
      console.error('Delete Setting Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to delete setting');
    }
  }
}

export const settingsService = new SettingsService();

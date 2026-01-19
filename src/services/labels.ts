import { apiService } from './api';

export interface Label {
  _id?: string;
  id: string;
  label_id?: string;
  label_name?: string;
  label_image?: string;
  name?: string;
  description?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface LabelsResponse {
  success?: boolean;
  message?: string;
  labels?: Label[];
  result?: {
    labels?: Label[];
    total?: number;
  };
  data?: Label[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class LabelsService {
  async getAllLabels(): Promise<Label[]> {
    try {
      const response = await apiService.get<LabelsResponse>('/api/admin/labels');
      console.log('Labels API Response:', response);
      
      let labels: Label[] = [];
      
      // Handle the actual response structure
      if ((response as any).labels && Array.isArray((response as any).labels)) {
        labels = (response as any).labels;
      } else if (response.success && response.result?.labels) {
        labels = response.result.labels;
      } else if (response.labels) {
        labels = response.labels;
      } else if (Array.isArray(response)) {
        labels = response;
      } else if (response.result && Array.isArray(response.result)) {
        labels = response.result;
      }
      
      // Map labels to ensure they have both _id and id for compatibility
      return labels.map((label) => ({
        ...label,
        _id: label.id || label._id,
        id: label.id || label._id || String(Math.random()),
      }));
    } catch (error) {
      console.error('Get Labels Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to fetch labels');
    }
  }

  async getLabelById(labelId: string): Promise<Label> {
    try {
      const response = await apiService.get<LabelsResponse>(`/api/admin/labels/${labelId}`);
      console.log('Get Label by ID API Response:', response);
      
      let label: Label | null = null;
      
      // Handle different response structures
      if ((response as any).label) {
        label = (response as any).label;
      } else if (response.success && response.result) {
        if ((response.result as any).label) {
          label = (response.result as any).label;
        } else if (typeof response.result === 'object' && !Array.isArray(response.result)) {
          label = response.result as any;
        }
      } else if (response.labels && Array.isArray(response.labels) && response.labels.length > 0) {
        label = response.labels[0];
      } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        label = response.data[0];
      }
      
      if (!label) {
        throw new Error('Label not found');
      }
      
      // Ensure label has both _id and id for compatibility
      return {
        ...label,
        _id: label.id || label._id || labelId,
        id: label.id || label._id || labelId,
      };
    } catch (error) {
      console.error('Get Label by ID Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to fetch label');
    }
  }

  async updateLabel(labelId: string, data: { label_name?: string; label_image?: string; description?: string; color?: string }): Promise<Label> {
    try {
      const response = await apiService.put<LabelsResponse>(`/api/admin/labels/${labelId}`, data);
      console.log('Update Label API Response:', response);
      
      let updatedLabel: Label | null = null;
      
      if ((response as any).label) {
        updatedLabel = (response as any).label;
      } else if (response.success && response.result && typeof response.result === 'object') {
        updatedLabel = (response.result as any).label || response.result as any;
      } else if (response.labels && Array.isArray(response.labels) && response.labels.length > 0) {
        updatedLabel = response.labels[0];
      }
      
      if (!updatedLabel) {
        throw new Error('Invalid response format: label data not found');
      }
      
      return {
        ...updatedLabel,
        _id: updatedLabel.id || updatedLabel._id,
        id: updatedLabel.id || updatedLabel._id || String(Math.random()),
      };
    } catch (error) {
      console.error('Update Label Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to update label');
    }
  }

  async deleteLabel(labelId: string): Promise<void> {
    try {
      await apiService.delete(`/api/admin/labels/${labelId}`);
    } catch (error) {
      console.error('Delete Label Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to delete label');
    }
  }
}

export const labelsService = new LabelsService();

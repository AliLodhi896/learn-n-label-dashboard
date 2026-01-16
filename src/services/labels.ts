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

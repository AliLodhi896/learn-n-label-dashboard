import { apiService } from './api';

export interface Newsletter {
  _id?: string;
  id: string;
  newsletter_id?: string;
  title?: string;
  subject?: string;
  content?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface NewslettersResponse {
  success?: boolean;
  message?: string;
  newsletters?: Newsletter[];
  result?: {
    newsletters?: Newsletter[];
    total?: number;
  };
  data?: Newsletter[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class NewslettersService {
  async getAllNewsletters(): Promise<Newsletter[]> {
    try {
      const response = await apiService.get<NewslettersResponse>('/api/admin/newsletters');
      console.log('Newsletters API Response:', response);
      
      let newsletters: Newsletter[] = [];
      
      // Handle the actual response structure
      if ((response as any).newsletters && Array.isArray((response as any).newsletters)) {
        newsletters = (response as any).newsletters;
      } else if (response.success && response.result?.newsletters) {
        newsletters = response.result.newsletters;
      } else if (response.newsletters) {
        newsletters = response.newsletters;
      } else if (Array.isArray(response)) {
        newsletters = response;
      } else if (response.result && Array.isArray(response.result)) {
        newsletters = response.result;
      }
      
      // Map newsletters to ensure they have both _id and id for compatibility
      return newsletters.map((newsletter) => ({
        ...newsletter,
        _id: newsletter.id || newsletter._id,
        id: newsletter.id || newsletter._id || String(Math.random()),
      }));
    } catch (error) {
      console.error('Get Newsletters Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to fetch newsletters');
    }
  }

  async deleteNewsletter(newsletterId: string): Promise<void> {
    try {
      await apiService.delete(`/api/admin/newsletters/${newsletterId}`);
    } catch (error) {
      console.error('Delete Newsletter Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to delete newsletter');
    }
  }
}

export const newslettersService = new NewslettersService();

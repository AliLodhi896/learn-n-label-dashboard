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
  templates?: Newsletter[];
  result?: {
    newsletters?: Newsletter[];
    templates?: Newsletter[];
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
      const response = await apiService.get<NewslettersResponse>('/api/admin/templates');
      console.log('Templates API Response:', response);
      
      let newsletters: Newsletter[] = [];
      
      // Handle the actual response structure - check for templates first
      if ((response as any).templates && Array.isArray((response as any).templates)) {
        newsletters = (response as any).templates;
      } else if (response.success && response.result?.templates) {
        newsletters = response.result.templates;
      } else if (response.templates && Array.isArray(response.templates)) {
        newsletters = response.templates;
      } else if ((response as any).newsletters && Array.isArray((response as any).newsletters)) {
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
      console.error('Get Templates Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to fetch templates');
    }
  }

  async createTemplate(data: { title?: string; subject?: string; content?: string; status?: string }): Promise<Newsletter> {
    try {
      const response = await apiService.post<NewslettersResponse>('/api/admin/templates', data);
      console.log('Create Template API Response:', response);
      
      let createdTemplate: Newsletter | null = null;
      
      // Handle different response structures
      if ((response as any).template) {
        createdTemplate = (response as any).template;
      } else if ((response as any).templates && Array.isArray((response as any).templates) && (response as any).templates.length > 0) {
        createdTemplate = (response as any).templates[0];
      } else if (response.success && response.result) {
        if ((response.result as any).template) {
          createdTemplate = (response.result as any).template;
        } else if ((response.result as any).templates && Array.isArray((response.result as any).templates) && (response.result as any).templates.length > 0) {
          createdTemplate = (response.result as any).templates[0];
        } else if (typeof response.result === 'object' && !Array.isArray(response.result)) {
          createdTemplate = response.result as any;
        }
      } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        createdTemplate = response.data[0];
      }
      
      if (!createdTemplate) {
        throw new Error('Invalid response format: template data not found');
      }
      
      return {
        ...createdTemplate,
        _id: createdTemplate.id || createdTemplate._id,
        id: createdTemplate.id || createdTemplate._id || String(Math.random()),
      };
    } catch (error) {
      console.error('Create Template Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      throw new Error('Failed to create template');
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

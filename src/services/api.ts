// Use production base URL
const API_BASE_URL = 'https://learn-n-label-backend.vercel.app/';

export interface ApiError {
  message: string;
  status?: number;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Remove leading slash from endpoint if baseURL already ends with slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${this.baseURL}${cleanEndpoint}`;
    
    const token = localStorage.getItem('authToken');
    console.log(`API Request to ${url}:`, {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
    });
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('No token found in localStorage for request to:', endpoint);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'omit',
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, it might be an error response
          const text = await response.text();
          throw {
            message: `Invalid JSON response: ${text.substring(0, 100)}`,
            status: response.status,
          } as ApiError;
        }
      } else {
        // Non-JSON response (could be HTML error page)
        await response.text(); // Read the response to avoid memory leaks
        throw {
          message: `Unexpected response format. Status: ${response.status}`,
          status: response.status,
        } as ApiError;
      }

      // Handle API response format: { success: false, result: { CODE, MESSAGE } }
      if (data.success === false) {
        const errorMessage =
          data.result?.MESSAGE ||
          data.result?.message ||
          data.message ||
          'An error occurred';
        const error: ApiError = {
          message: errorMessage,
          status: response.status,
        };
        throw error;
      }

      // If success is true or not specified, check response.ok
      if (!response.ok) {
        const errorMessage =
          data.result?.MESSAGE ||
          data.result?.message ||
          data.message ||
          `Request failed with status ${response.status}`;
        const error: ApiError = {
          message: errorMessage,
          status: response.status,
        };
        throw error;
      }

      // Return data even if success is not explicitly true (some APIs might not include it)
      // Only throw error if success is explicitly false
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      console.error('Request URL:', url);
      console.error('Request Options:', { method: options.method, headers });
      
      // If it's already an ApiError, re-throw it
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      
      // Handle network errors and CORS errors
      if (error instanceof TypeError) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          // Check if it's a CORS error
          if (errorMessage.includes('cors') || errorMessage.includes('cross-origin')) {
            throw {
              message: 'CORS Error: The server is not allowing requests from this origin. Please check CORS configuration on the backend.',
            } as ApiError;
          }
          throw {
            message: `Network error: ${error.message}. This might be a CORS issue. Please check your browser console for more details.`,
          } as ApiError;
        }
      }
      
      if (error instanceof Error) {
        throw {
          message: error.message || 'An unexpected error occurred',
        } as ApiError;
      }
      
      throw {
        message: 'An unexpected error occurred',
      } as ApiError;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiService = new ApiService(API_BASE_URL);

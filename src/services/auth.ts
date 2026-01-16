import { apiService, ApiError } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success?: boolean;
  result?: {
    token?: string;
    accessToken?: string;
    user?: {
      id: string;
      email: string;
      role: string;
      name?: string;
    };
    CODE?: string;
    MESSAGE?: string;
  };
  token?: string;
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
  message?: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'user';

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('Login attempt with credentials:', { email: credentials.email });
      const response = await apiService.post<LoginResponse>(
        '/api/auth/login',
        credentials
      );

      console.log('Login API Response:', JSON.stringify(response, null, 2));

      // Extract user from response (handle different response structures)
      // API might return: { success: true, result: { user, token } } or { user, token }
      let user: User | undefined = response.user;
      
      // Check in result object
      if (!user && response.result?.user) {
        user = response.result.user;
      }
      
      // Check in data object
      if (!user && 'data' in response) {
        user = (response as unknown as { data: { user: User } }).data?.user;
      }
      
      // Check if result has user nested differently
      if (!user && response.result && typeof response.result === 'object') {
        const result = response.result as any;
        if (result.user) {
          user = result.user;
        }
      }

      console.log('Extracted user:', user);

      // Check if user role is Admin (case-insensitive check)
      if (user) {
        const userRole = user.role?.trim();
        console.log('User role:', userRole);
        if (userRole && userRole.toLowerCase() !== 'admin') {
          // Clear any partial data
          this.logout();
          throw {
            message: 'Access denied. Only Admin users can login.',
            status: 403,
          } as ApiError;
        }
      } else {
        // If no user data in response, we can't verify role - deny access
        console.error('No user data found in response');
        this.logout();
        throw {
          message: 'Access denied. User role information not available.',
          status: 403,
        } as ApiError;
      }

      // Store token (handle both 'token' and 'accessToken' response formats)
      // Check in result object first, then root level, and also check all possible nested locations
      const responseAny = response as any;
      let token: string | undefined;
      
      // Try all possible token locations
      token =
        response.result?.token ||
        response.result?.accessToken ||
        response.token ||
        response.accessToken ||
        responseAny.result?.token ||
        responseAny.result?.accessToken ||
        responseAny.data?.token ||
        responseAny.data?.accessToken ||
        responseAny.token ||
        responseAny.accessToken;
      
      // Also check if token is directly in result object with different structure
      if (!token && response.result) {
        const result = response.result as any;
        token = result.token || result.accessToken || result.authToken;
      }
      
      // Deep search for token in the entire response object
      if (!token) {
        const deepSearch = (obj: any, depth = 0): string | null => {
          if (depth > 3) return null; // Prevent infinite recursion
          if (typeof obj !== 'object' || obj === null) return null;
          
          // Check common token field names
          const tokenFields = ['token', 'accessToken', 'authToken', 'access_token', 'auth_token', 'jwt', 'jwtToken'];
          for (const field of tokenFields) {
            if (obj[field] && typeof obj[field] === 'string') {
              return obj[field];
            }
          }
          
          // Recursively search nested objects
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              const found = deepSearch(obj[key], depth + 1);
              if (found) return found;
            }
          }
          return null;
        };
        
        const deepToken = deepSearch(response);
        if (deepToken) {
          console.log('Token found via deep search!');
          token = deepToken;
        }
      }
      
      console.log('Token extraction attempt:', {
        'response.result?.token': response.result?.token,
        'response.result?.accessToken': response.result?.accessToken,
        'response.token': response.token,
        'response.accessToken': response.accessToken,
        'responseAny.result': responseAny.result,
        'Final token': token ? 'Token found' : 'No token found',
      });

      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
        console.log('Token stored in localStorage:', token.substring(0, 20) + '...');
        // Verify it was stored
        const storedToken = localStorage.getItem(this.TOKEN_KEY);
        console.log('Verification - Token in localStorage:', storedToken ? 'YES' : 'NO');
      } else {
        console.error('❌ No token found in response!');
        console.error('Response keys:', Object.keys(response));
        console.error('Response.result keys:', response.result ? Object.keys(response.result) : 'No result');
        console.error('Full response structure:', JSON.stringify(response, null, 2));
        console.error('Please check the response structure above to find where the token is located');
      }

      // Store user data
      if (user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        console.log('User data stored in localStorage');
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw with proper error handling
      if (error && typeof error === 'object' && 'message' in error) {
        throw error as ApiError;
      }
      throw {
        message: 'Login failed. Please check your credentials.',
      } as ApiError;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'Admin';
  }
}

export const authService = new AuthService();

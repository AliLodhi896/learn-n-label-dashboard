import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from 'services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    const storedUser = authService.getUser();
    console.log('AuthProvider mount - storedUser:', storedUser);
    if (storedUser) {
      setUser(storedUser);
      console.log('AuthProvider - User loaded from storage');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await authService.login({ email, password });
      // Wait a bit for localStorage to be updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the user from localStorage after login (authService stores it)
      const loggedInUser = authService.getUser();
      console.log('AuthProvider - User after login:', loggedInUser);
      console.log('AuthProvider - Token after login:', authService.getToken() ? 'Token exists' : 'No token');
      
      if (loggedInUser) {
        setUser(loggedInUser);
        console.log('AuthProvider - User state updated');
      } else {
        console.error('AuthProvider - No user found after login');
        // Try to get user one more time
        const retryUser = authService.getUser();
        if (retryUser) {
          setUser(retryUser);
          console.log('AuthProvider - User found on retry');
        } else {
          throw new Error('Login successful but user data not available');
        }
      }
    } catch (error) {
      console.error('AuthProvider - Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Consider authenticated if we have user data
  // Token is preferred but user data is sufficient for authentication state
  const storedUser = authService.getUser();
  const hasUser = !!user || !!storedUser;
  
  // If user is in storage but not in state, load it
  useEffect(() => {
    if (!user && storedUser) {
      console.log('AuthProvider - Loading user from storage into state');
      setUser(storedUser);
    }
  }, [user, storedUser]);
  
  const isAuthenticated = hasUser; // Allow authentication if user exists
  
  console.log('AuthProvider state:', {
    user,
    isAuthenticated,
    isLoading,
    hasToken: !!authService.getToken(),
    hasUserInStorage: !!authService.getUser(),
  });

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

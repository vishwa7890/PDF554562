import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is authenticated on mount
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      console.log('AuthContext: Initializing auth, saved token:', !!savedToken);
      
      if (savedToken) {
        try {
          // Set the authorization header before making the request
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const response = await api.get('/auth/me');
          
          if (isMounted) {
            console.log('AuthContext: Token valid, setting user:', response.data.username);
            setUser(response.data);
            setToken(savedToken);
          }
        } catch (error) {
          // Token is invalid, clear it
          console.log('AuthContext: Token invalid, clearing auth state');
          if (isMounted) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete api.defaults.headers.common['Authorization'];
          }
        }
      }
      
      if (isMounted) {
        console.log('AuthContext: Auth initialization complete');
        setIsLoading(false);
      }
    };

    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    console.log('AuthContext: Starting login for user:', username);
    
    try {
      // Make the login request
      const response = await api.post('/auth/login', { username, password });
      const { access_token, user: userData } = response.data;
      
      console.log('AuthContext: Login response received, token:', !!access_token, 'user:', userData?.username);
      
      if (!access_token) {
        throw new Error('No access token received');
      }
      
      // Set the token in localStorage first
      localStorage.setItem('token', access_token);
      console.log('AuthContext: Token saved to localStorage');
      
      // Update the API client's default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      console.log('AuthContext: API headers updated');
      
      // Update the state synchronously - both token and user at the same time
      setToken(access_token);
      setUser(userData);
      console.log('AuthContext: State updated - user and token set');
      
      // Show success message
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${userData.username}!`,
      });
      
      return true;
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      
      // Clear any invalid tokens
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      
      // Show error message
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      await api.post('/auth/register', { username, email, password });
      
      // Automatically log in after successful signup
      await login(username, password);
      
      toast({
        title: 'Account Created',
        description: 'Your account has been successfully created!',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Signup failed. Please try again.';
      toast({
        title: 'Signup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    // Clear the token from localStorage and state
    localStorage.removeItem('token');
    
    // Remove the authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Reset the user state
    setToken(null);
    setUser(null);
    
    // Show logout message
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    
    // Force a full page reload to clear any cached data
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import { User, AuthState, LoginFormData, RegisterFormData } from '@/types';

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          const parsedUser = JSON.parse(user) as User;
          setAuthState({
            user: parsedUser,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthState({ ...initialAuthState, isLoading: false });
        }
      } else {
        setAuthState({ ...initialAuthState, isLoading: false });
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = useCallback(async (data: LoginFormData) => {
    try {
      const response = await authApi.login(data);
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Redirect based on role
      switch (user.role) {
        case 'PLATFORM_ADMIN':
          navigate('/platform-admin/dashboard');
          break;
        case 'HOTEL_ADMIN':
          navigate('/hotel-admin/dashboard');
          break;
        case 'STAFF':
          navigate('/staff/dashboard');
          break;
        default:
          navigate('/');
      }

      return { success: true, user, token };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  }, [navigate]);

  // Register
  const register = useCallback(async (data: RegisterFormData) => {
    try {
      const response = await authApi.register(data);
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      navigate('/');
      return { success: true, user, token };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  }, [navigate]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    navigate('/login');
  }, [navigate]);

  // Fetch current user
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      const user = response.data.data;

      localStorage.setItem('user', JSON.stringify(user));
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
      }));

      return user;
    } catch (error: any) {
      logout();
      throw error;
    }
  }, [logout]);

  return {
    authState,
    login,
    register,
    logout,
    fetchCurrentUser,
  };
};

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Create context
import { createContext, useContext } from 'react';

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

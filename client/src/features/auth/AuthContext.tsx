import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../services';
import { LoginInput, RegisterInput } from '@analyticiq/shared';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Business {
  id: string;
  name: string;
  slug: string;
}

interface AuthContextType {
  user: User | null;
  business: Business | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Initialize and check current user session if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data?.success && response.data?.data?.user) {
          const fetchedUser = response.data.data.user;
          // The backend returns business details as well or we can parse the token or fetch them.
          // Wait, `/auth/me` returns `user` which contains `businessId` and role.
          // We can construct User from user, and since business details might not be returned in /me,
          // let's store business in localStorage on login/register and read it here.
          setUser({
            id: fetchedUser.id,
            name: fetchedUser.name,
            email: fetchedUser.email,
            role: fetchedUser.role,
          });

          const storedBusiness = localStorage.getItem('business');
          if (storedBusiness) {
            setBusiness(JSON.parse(storedBusiness));
          }
        } else {
          // If response not success, clear session
          handleLogout();
        }
      } catch (error) {
        console.error('Failed to verify session token', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  const login = async (credentials: LoginInput) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', credentials);
      const {
        token: receivedToken,
        user: loggedUser,
        business: loggedBusiness,
      } = response.data.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('business', JSON.stringify(loggedBusiness));

      setToken(receivedToken);
      setUser(loggedUser);
      setBusiness(loggedBusiness);
    } catch (error) {
      handleLogout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      const {
        token: receivedToken,
        user: registeredUser,
        business: registeredBusiness,
      } = response.data.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('business', JSON.stringify(registeredBusiness));

      setToken(receivedToken);
      setUser(registeredUser);
      setBusiness(registeredBusiness);
    } catch (error) {
      handleLogout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('business');
    setToken(null);
    setUser(null);
    setBusiness(null);
  };

  const logout = () => {
    handleLogout();
  };

  const value = {
    user,
    business,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

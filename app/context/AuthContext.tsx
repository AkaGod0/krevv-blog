"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance with interceptor
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = Cookies.get('auth_token');
     
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('❌ No token found in cookies');
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // ✅ Safely extract error message
    const errorMessage = String(
      error.response?.data?.message || 
      error.message || 
      "Request failed"
    );
    
    // ✅ Safe toLowerCase check
    const errorLower = errorMessage.toLowerCase();
    
    // ✅ Only log unexpected errors (not blocked/unverified users)
    if (!errorLower.includes("blocked") && 
        !errorLower.includes("verify")) {
      console.error('❌ API Error:', errorMessage);
    } else {
      console.log('ℹ️ Expected authentication issue:', errorMessage.substring(0, 50) + "...");
    }
    
    // If 401, clear token and redirect to login
    if (error.response?.status === 401) {
      console.log('🔓 Unauthorized - clearing token');
      if (typeof window !== 'undefined') {
        Cookies.remove('auth_token');
      }
    }
    return Promise.reject(error);
  }
);

export { api };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (typeof window !== 'undefined') {
        const storedToken = Cookies.get('auth_token');
        
        if (storedToken) {
          setToken(storedToken);
          const res = await api.get('/users/me');
          setUser(res.data);
        } else {
          console.log('⚠️ No token in cookies, user not authenticated');
        }
      }
    } catch (error: any) {
      console.error('❌ Auth check failed:', error);
      console.error('❌ Error response:', error.response?.data);
      if (typeof window !== 'undefined') {
        Cookies.remove('auth_token');
      }
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
      console.log('✅ Auth check complete');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { email, password }
      );
      
      const { user: userData, token: authToken } = res.data;
      
      if (typeof window !== 'undefined') {
        // ✅ Store token in cookie with security options
        Cookies.set('auth_token', authToken, {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production', // HTTPS only in production
          sameSite: 'strict', // CSRF protection
          path: '/', // Available across entire site
        });
        
        // Verify it was saved
        const savedToken = Cookies.get('auth_token');
        console.log('✅ Token saved:', savedToken ? 'YES' : 'NO');
      }
      
      setUser(userData);
      setToken(authToken);
      console.log('✅ Login successful');
    } catch (error: any) {
      // ✅ Safely extract error message
      const errorMessage = String(
        error.response?.data?.message || 
        error.message || 
        "Login failed"
      );
      
      // ✅ Safe toLowerCase check
      const errorLower = errorMessage.toLowerCase();
      
      // ✅ Only log unexpected errors (not blocked/unverified users)
      if (!errorLower.includes("blocked") && 
          !errorLower.includes("verify")) {
        console.error("❌ Login error:", error);
      } else {
        console.log("ℹ️ Login prevented:", errorMessage.substring(0, 50) + "...");
      }
      
      // Re-throw so login page can handle it
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out...');
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      if (typeof window !== 'undefined') {
        Cookies.remove('auth_token', { path: '/' });
        console.log('✅ Token removed');
      }
      setUser(null);
      setToken(null);
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
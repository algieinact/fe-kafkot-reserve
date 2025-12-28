import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import { authApi } from "../services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Token invalid, clear it
        localStorage.removeItem("auth_token");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login({ username, password });

      if (response.success && response.data) {
        localStorage.setItem("auth_token", response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || "Login gagal",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Terjadi kesalahan saat login",
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
